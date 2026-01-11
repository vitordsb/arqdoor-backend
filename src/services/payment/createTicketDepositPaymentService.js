const dayjs = require("dayjs");
const asaasClient = require("../../config/asaas");
const Conversation = require("../../models/Conversation");
const Payment = require("../../models/Payment");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const ensureAsaasCustomerService = require("./ensureAsaasCustomerService");
const { isPaidStatus, isPendingStatus } = require("../../utils/asaasStatuses");
const { updateTicketPaymentStatus } = require("../../utils/updateTicketPaymentStatus");

const EXPIRATION_MINUTES = Number(process.env.ASAAS_PIX_EXPIRATION_MINUTES || 60);
const BOLETO_DAYS_TO_DUE = Number(process.env.ASAAS_BOLETO_DAYS_TO_DUE || 3);

const normalizeMethod = (value) => {
  const normalized = (value || "").toString().trim().toUpperCase();
  if (["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD"].includes(normalized)) {
    return normalized;
  }
  return "PIX";
};

const billingTypeForMethod = (method) => {
  if (method === "PIX") return "PIX";
  if (method === "BOLETO") return "BOLETO";
  if (method === "CREDIT_CARD" || method === "DEBIT_CARD") return "UNDEFINED";
  return "PIX";
};

const isValidPendingPayment = (payment, method) => {
  if (!isPendingStatus(payment.status)) return false;
  if (method === "PIX") {
    return !payment.pix_expires_at || dayjs(payment.pix_expires_at).isAfter(dayjs());
  }
  if (method === "BOLETO") {
    return !payment.due_date || dayjs(payment.due_date).endOf("day").isAfter(dayjs());
  }
  return true;
};

const serializePayment = (payment, method, extras = {}) => {
  const normalizedMethod = method || payment.method || "PIX";
  const base = {
    payment_id: payment.id,
    asaas_payment_id: payment.asaas_payment_id,
    status: payment.status,
    amount: Number(payment.amount),
    step_id: payment.step_id,
    ticket_id: payment.ticket_id,
    attempt: payment.attempt || extras.attempt || 1,
    method: normalizedMethod,
    invoice_url: payment.asaas_invoice_url,
    checkout_url: payment.checkout_url || payment.asaas_invoice_url,
  };

  if (normalizedMethod === "PIX") {
    base.pix = {
      copy_and_paste: extras.pixPayload ?? payment.pix_payload,
      qr_code_image: extras.pixImage ?? payment.pix_image,
      expires_at:
        extras.pixExpiresAt ??
        (payment.pix_expires_at ? dayjs(payment.pix_expires_at).toISOString() : undefined),
    };
  }

  if (normalizedMethod === "BOLETO") {
    base.boleto = {
      digitable_line: extras.boletoLine ?? payment.boleto_barcode,
      pdf_url: extras.boletoUrl ?? payment.boleto_url ?? payment.asaas_invoice_url,
      due_date:
        extras.boletoDueDate ??
        (payment.due_date ? dayjs(payment.due_date).toISOString() : undefined),
    };
  }

  return base;
};

/**
 * Gera cobrança (PIX, Boleto ou Cartão via checkout) do valor total do contrato.
 * Usa a etapa de assinatura como referência.
 */
const createTicketDepositPaymentService = async (ticketId, user, payload = {}) => {
  try {
    const ticket = await TicketService.findByPk(ticketId);
    if (!ticket) {
      return { code: 404, message: "Ticket não encontrado", success: false };
    }
    const paymentPreference = (ticket.payment_preference || "at_end")
      .toString()
      .toLowerCase();
    if (paymentPreference !== "at_end") {
      return {
        code: 400,
        message: "Este ticket utiliza pagamento por etapa.",
        success: false,
      };
    }

    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation || (conversation.user1_id !== user.id && conversation.user2_id !== user.id)) {
      return { code: 403, message: "O usuário não faz parte desta conversa", success: false };
    }

    if (user.type !== "contratante") {
      return { code: 403, message: "Somente o contratante pode gerar pagamentos", success: false };
    }

    const steps = await Step.findAll({
      where: { ticket_id: ticketId },
      order: [["id", "ASC"]],
    });

    if (!steps.length) {
      return { code: 400, message: "Nenhuma etapa vinculada ao ticket", success: false };
    }

    const signatureStep = steps[0];
    const contractorSigned =
      signatureStep?.confirm_contractor ||
      signatureStep?.confirmContractor ||
      (signatureStep?.status || "").toLowerCase() === "concluido";

    if (!contractorSigned) {
      return { code: 400, message: "Contrato ainda não assinado pelo cliente", success: false };
    }

    const totalAmount = steps.reduce((acc, s) => {
      const price = Number(s.price) || 0;
      return price > 0 ? acc + price : acc;
    }, 0);

    if (!totalAmount || totalAmount <= 0) {
      return { code: 400, message: "Não há valor configurado para depósito em garantia", success: false };
    }

    const method = normalizeMethod(payload.method);

    const existingPayments = await Payment.findAll({
      where: { ticket_id: ticket.id, step_id: signatureStep.id },
      order: [["created_at", "DESC"]],
    });

    const paidPayment = existingPayments.find((p) => isPaidStatus(p.status));
    if (paidPayment) {
      return { code: 400, message: "O depósito em garantia já está pago para este ticket", success: false };
    }

    const pendingPayment = existingPayments.find(
      (p) => (p.method || "PIX") === method && isValidPendingPayment(p, method)
    );
    if (pendingPayment) {
      return {
        code: 200,
        message: "Cobrança pendente já existente",
        success: true,
        data: serializePayment(pendingPayment, method),
      };
    }

    const attempt = existingPayments.length + 1;

    let customer;
    try {
      customer = await ensureAsaasCustomerService(user.id);
    } catch (customerError) {
      return { code: 400, message: customerError.message, success: false };
    }

    const billingType = billingTypeForMethod(method);
    const dueDate =
      method === "BOLETO"
        ? dayjs().add(BOLETO_DAYS_TO_DUE, "day")
        : dayjs();
    const expiresAt = method === "PIX" ? dayjs().add(EXPIRATION_MINUTES, "minute") : null;
    const description = `Depósito em garantia do ticket #${ticket.id}`;

    const paymentPayload = {
      customer: customer.asaas_customer_id,
      billingType,
      value: totalAmount,
      dueDate: dueDate.format("YYYY-MM-DD"),
      description,
      externalReference: `ticket-${ticket.id}-deposit-attempt-${attempt}-${method.toLowerCase()}`,
    };

    let paymentData;
    try {
      const paymentResponse = await asaasClient.post("/payments", paymentPayload);
      paymentData = paymentResponse.data;
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const apiMsg = Array.isArray(apiErrors) && apiErrors.length > 0
        ? apiErrors.map((e) => e?.description || e?.code || "").filter(Boolean).join(" | ")
        : err?.response?.data?.message || err?.message;
      return { code: 400, message: apiMsg || "Erro ao criar cobrança no Asaas", success: false };
    }

    let pixData = null;
    if (method === "PIX") {
      const pixResponse = await asaasClient.get(`/payments/${paymentData.id}/pixQrCode`);
      pixData = pixResponse.data || {};
    }

    const payment = await Payment.create({
      step_id: signatureStep.id,
      ticket_id: ticket.id,
      contractor_id: user.id,
      provider_id: ticket.provider_id,
      amount: totalAmount,
      currency: "BRL",
      status: paymentData.status || "PENDING",
      method,
      asaas_payment_id: paymentData.id,
      asaas_invoice_url: paymentData.invoiceUrl,
      checkout_url: paymentData.invoiceUrl,
      pix_payload: method === "PIX" ? pixData?.payload || null : null,
      pix_image: method === "PIX" ? pixData?.encodedImage || null : null,
      pix_expires_at:
        method === "PIX"
          ? pixData?.expirationDate
            ? dayjs(pixData.expirationDate).toDate()
            : expiresAt?.toDate() || null
          : null,
      boleto_url: method === "BOLETO" ? paymentData.bankSlipUrl || paymentData.invoiceUrl : null,
      boleto_barcode: method === "BOLETO" ? paymentData.identificationField || null : null,
      due_date: paymentData.dueDate ? dayjs(paymentData.dueDate).toDate() : dueDate.toDate(),
      description,
      raw_response: JSON.stringify(paymentData),
      attempt,
      last_event: "PAYMENT_CREATED",
    });

    const data = serializePayment(payment, method, {
      pixPayload: pixData?.payload,
      pixImage: pixData?.encodedImage,
      pixExpiresAt: pixData?.expirationDate,
      boletoUrl: paymentData?.bankSlipUrl,
      boletoLine: paymentData?.identificationField,
      boletoDueDate: paymentData?.dueDate,
      attempt,
    });

    try {
      await updateTicketPaymentStatus(ticket.id);
    } catch (e) {
      console.warn("Falha ao atualizar status de pagamento do ticket:", e?.message || e);
    }

    const successMessage =
      method === "PIX"
        ? "Cobrança PIX gerada com sucesso (depósito em garantia)"
        : method === "BOLETO"
          ? "Boleto do depósito gerado com sucesso"
          : "Link para pagamento com cartão gerado";

    return { code: 201, message: successMessage, success: true, data };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createTicketDepositPaymentService;
