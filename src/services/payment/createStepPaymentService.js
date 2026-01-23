const dayjs = require("dayjs");
const asaasClient = require("../../config/asaas");
const Conversation = require("../../models/Conversation");
const Payment = require("../../models/Payment");
const PaymentRequest = require("../../models/PaymentRequest");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const sequelize = require("../../database/config");
const ensureAsaasCustomerService = require("./ensureAsaasCustomerService");
const { isPaidStatus, isPendingStatus } = require("../../utils/asaasStatuses");
const { ConflictError } = require("../../utils/AppError");

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

const createStepPaymentService = async (stepId, payload = {}, user, idempotencyKey = null) => {
  // ===== IDEMPOTÊNCIA: Verificar se já existe requisição com esta chave =====
  if (idempotencyKey) {
    const existingRequest = await PaymentRequest.findOne({
      where: { idempotency_key: idempotencyKey }
    });

    if (existingRequest) {
      if (existingRequest.status === 'completed') {
        console.log(`[createStepPaymentService] Idempotency hit: ${idempotencyKey}`);
        return JSON.parse(existingRequest.response);
      }

      if (existingRequest.status === 'processing') {
        throw new ConflictError('Requisição já está sendo processada. Aguarde alguns segundos.');
      }

      if (existingRequest.status === 'failed') {
        // Permitir retry em caso de falha anterior
        console.log(`[createStepPaymentService] Retrying failed request: ${idempotencyKey}`);
      }
    }
  }

  try {
    const step = await Step.findByPk(stepId);
    if (!step) {
      return { code: 404, message: "Etapa não encontrada", success: false };
    }

    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      return { code: 404, message: "Ticket não encontrado para a etapa", success: false };
    }
    const paymentPreference = (ticket.payment_preference || "at_end")
      .toString()
      .toLowerCase();
    if (paymentPreference === "at_end") {
      return {
        code: 400,
        message: "Este ticket utiliza depósito em garantia.",
        success: false,
      };
    }
    const isCustom = paymentPreference === "custom";

    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation) {
      return { code: 404, message: "Conversa não encontrada", success: false };
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return { code: 403, message: "O usuário não faz parte desta conversa", success: false };
    }

    if (user.type !== "contratante") {
      return { code: 403, message: "Somente o contratante pode gerar pagamentos", success: false };
    }

    if (!isCustom) {
      if (!step.confirm_freelancer) {
        return {
          code: 400,
          message: "O prestador ainda não marcou a etapa como concluída",
          success: false,
        };
      }
      if (!step.confirm_contractor) {
        return {
          code: 400,
          message: "O cliente ainda não aceitou a etapa",
          success: false,
        };
      }
    } else {
      const stepStatus = (step.status || "").toString().toLowerCase();
      if (stepStatus === "recusado") {
        return {
          code: 400,
          message: "Etapa recusada não pode ser paga.",
          success: false,
        };
      }
    }

    if (step.is_financially_cleared) {
      return {
        code: 400,
        message: "Esta etapa já está paga.",
        success: false,
      };
    }

    const price = Number(step.price);
    if (!price || price <= 0) {
      return { code: 400, message: "O valor da etapa não é válido", success: false };
    }
    if (price < 5) {
      return { code: 400, message: "O valor da etapa não pode ser menor que R$ 5,00", success: false };
    }

    // verificação de grupo de pagamento
    if (step.group_id) {
      const groupCount = await Step.count({
        where: { ticket_id: ticket.id, group_id: step.group_id },
      });
      if (groupCount > 1) {
        return {
          code: 400,
          message: "Esta etapa faz parte de um grupo de pagamento e deve ser paga em conjunto com as outras etapas do grupo.",
          success: false,
        };
      }
    }

    const method = normalizeMethod(payload.method);

    const existingPayments = await Payment.findAll({
      where: { step_id: step.id },
      order: [["created_at", "DESC"]],
    });

    const paidPayment = existingPayments.find((p) => isPaidStatus(p.status));
    if (paidPayment) {
      return {
        code: 400,
        message: "Esta etapa já possui um pagamento concluído",
        success: false,
      };
    }

    const pendingPayments = existingPayments.filter((p) => isPendingStatus(p.status));
    let reusablePayment = null;

    for (const p of pendingPayments) {
      const isReusable = !reusablePayment && (p.method || "PIX") === method && isValidPendingPayment(p, method);

      if (isReusable) {
        reusablePayment = p;
      } else {
        try {
          await asaasClient.delete(`/payments/${p.asaas_payment_id}`);
          await p.update({ status: "CANCELLED", last_event: "CANCELLED_BY_NEW_REQUEST" });
        } catch (err) {
          console.warn(`Falha ao cancelar pagamento pendente ${p.id}:`, err.message);
        }
      }
    }

    if (reusablePayment) {
      return {
        code: 200,
        message: "Cobrança pendente já existente",
        success: true,
        data: serializePayment(reusablePayment, method),
      };
    }

    const attempt = existingPayments.length + 1;

    let customer;
    try {
      customer = await ensureAsaasCustomerService(user.id);
    } catch (customerError) {
      return {
        code: 400,
        message: customerError.message,
        success: false,
      };
    }

    const billingType = billingTypeForMethod(method);
    const dueDate =
      method === "BOLETO"
        ? dayjs().add(BOLETO_DAYS_TO_DUE, "day")
        : dayjs();
    const expiresAt = method === "PIX" ? dayjs().add(EXPIRATION_MINUTES, "minute") : null;
    const description = payload.description || `Pagamento da etapa "${step.title}"`;

    const paymentPayload = {
      customer: customer.asaas_customer_id,
      billingType,
      value: price,
      dueDate: dueDate.format("YYYY-MM-DD"),
      description,
      externalReference: `step-${step.id}-ticket-${ticket.id}-attempt-${attempt}-${method.toLowerCase()}`,
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
      return {
        code: 400,
        message: apiMsg || "Erro ao criar cobrança no Asaas",
        success: false,
      };
    }

    let pixData = null;
    if (method === "PIX") {
      try {
        const pixResponse = await asaasClient.get(`/payments/${paymentData.id}/pixQrCode`);
        pixData = pixResponse.data || {};
      } catch (pixErr) {
        console.warn("Falha ao obter QRCode PIX no Asaas:", pixErr?.response?.data || pixErr);
      }
    }

    const payment = await Payment.create({
      step_id: step.id,
      ticket_id: ticket.id,
      contractor_id: user.id,
      provider_id: ticket.provider_id,
      amount: price,
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

    const successMessage =
      method === "PIX"
        ? "Cobrança PIX gerada com sucesso"
        : method === "BOLETO"
          ? "Boleto gerado com sucesso"
          : "Link para pagamento com cartão gerado";

    const result = {
      code: 201,
      message: successMessage,
      success: true,
      data,
    };

    // ===== IDEMPOTÊNCIA: Salvar resposta bem-sucedida =====
    if (idempotencyKey) {
      try {
        await PaymentRequest.upsert({
          idempotency_key: idempotencyKey,
          step_id: stepId,
          user_id: user.id,
          status: 'completed',
          response: JSON.stringify(result)
        });
        console.log(`[createStepPaymentService] Idempotency saved: ${idempotencyKey}`);
      } catch (upsertError) {
        console.error('[createStepPaymentService] Erro ao salvar idempotency:', upsertError);
        // Não falhar a requisição por erro de cache
      }
    }

    return result;
  } catch (error) {
    console.error("[createStepPaymentService] erro ao criar pagamento:", error?.response?.data || error);

    // ===== IDEMPOTÊNCIA: Registrar falha =====
    if (idempotencyKey) {
      try {
        await PaymentRequest.upsert({
          idempotency_key: idempotencyKey,
          step_id: stepId,
          user_id: user.id,
          status: 'failed',
          error_message: error?.message || 'Erro desconhecido'
        });
      } catch (upsertError) {
        console.error('[createStepPaymentService] Erro ao salvar falha de idempotency:', upsertError);
      }
    }

    const message =
      error?.response?.data?.message ||
      (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.length
        ? error.response.data.errors.map((e) => e?.description || e?.code).join(" | ")
        : null) ||
      error?.message ||
      "Erro interno ao criar pagamento";
    return {
      code: 400,
      success: false,
      message,
    };
  }
};

module.exports = createStepPaymentService;
