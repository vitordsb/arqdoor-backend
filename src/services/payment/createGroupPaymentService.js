const dayjs = require("dayjs");
const asaasClient = require("../../config/asaas");
const Conversation = require("../../models/Conversation");
const Payment = require("../../models/Payment");
const PaymentRequest = require("../../models/PaymentRequest");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const PaymentGroup = require("../../models/PaymentGroup");
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

/**
 * Create payment for an entire payment group
 * All steps in the group will be paid together
 */
const createGroupPaymentService = async (groupId, payload = {}, user, idempotencyKey = null) => {
  // Idempotency check
  if (idempotencyKey) {
    const existingRequest = await PaymentRequest.findOne({
      where: { idempotency_key: idempotencyKey }
    });

    if (existingRequest) {
      if (existingRequest.status === 'completed') {
        console.log(`[createGroupPaymentService] Idempotency hit: ${idempotencyKey}`);
        return JSON.parse(existingRequest.response);
      }

      if (existingRequest.status === 'processing') {
        throw new ConflictError('Requisição já está sendo processada. Aguarde alguns segundos.');
      }
    }
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Get payment group
    const paymentGroup = await PaymentGroup.findByPk(groupId, { transaction });
    if (!paymentGroup) {
      await transaction.rollback();
      return { code: 404, message: "Grupo de pagamento não encontrado", success: false };
    }

    // 2. Get all steps in the group
    const steps = await Step.findAll({
      where: { 
        ticket_id: paymentGroup.ticket_id,
        group_id: groupId
      },
      transaction
    });

    if (!steps || steps.length === 0) {
      await transaction.rollback();
      return { code: 404, message: "Nenhuma etapa encontrada neste grupo", success: false };
    }

    // 3. Verify ticket and payment preference
    const ticket = await TicketService.findByPk(paymentGroup.ticket_id, { transaction });
    if (!ticket) {
      await transaction.rollback();
      return { code: 404, message: "Ticket não encontrado", success: false };
    }

    const paymentPreference = (ticket.payment_preference || "at_end").toString().toLowerCase();
    if (paymentPreference !== "custom") {
      await transaction.rollback();
      return {
        code: 400,
        message: "Pagamento por grupo só está disponível no modo personalizado",
        success: false,
      };
    }

    // 4. Verify conversation and user permissions
    const conversation = await Conversation.findByPk(ticket.conversation_id, { transaction });
    if (!conversation) {
      await transaction.rollback();
      return { code: 404, message: "Conversa não encontrada", success: false };
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      await transaction.rollback();
      return { code: 403, message: "O usuário não faz parte desta conversa", success: false };
    }

    if (user.type !== "contratante") {
      await transaction.rollback();
      return { code: 403, message: "Somente o contratante pode gerar pagamentos", success: false };
    }

    // 5. Check if any step is already paid
    const paidSteps = steps.filter(s => s.is_financially_cleared);
    if (paidSteps.length > 0) {
      await transaction.rollback();
      return {
        code: 400,
        message: `${paidSteps.length} etapa(s) deste grupo já estão pagas`,
        success: false,
      };
    }

    // 6. Check if any step is refused
    const refusedSteps = steps.filter(s => (s.status || "").toString().toLowerCase() === "recusado");
    if (refusedSteps.length > 0) {
      await transaction.rollback();
      return {
        code: 400,
        message: "Este grupo contém etapas recusadas que não podem ser pagas",
        success: false,
      };
    }

    // 7. Calculate total amount
    const totalAmount = steps.reduce((sum, step) => sum + Number(step.price), 0);
    if (totalAmount < 5) {
      await transaction.rollback();
      return { code: 400, message: "O valor total do grupo não pode ser menor que R$ 5,00", success: false };
    }

    // 8. Check for existing payments
    const existingPayments = await Payment.findAll({
      where: { 
        ticket_id: ticket.id,
        step_id: steps.map(s => s.id)
      },
      order: [["created_at", "DESC"]],
      transaction
    });

    const paidPayment = existingPayments.find((p) => isPaidStatus(p.status));
    if (paidPayment) {
      await transaction.rollback();
      return {
        code: 400,
        message: "Este grupo já possui um pagamento concluído",
        success: false,
      };
    }

    // 9. Cancel pending payments for this group
    const pendingPayments = existingPayments.filter((p) => isPendingStatus(p.status));
    for (const p of pendingPayments) {
      try {
        await asaasClient.delete(`/payments/${p.asaas_payment_id}`);
        await p.update({ status: "CANCELLED", last_event: "CANCELLED_BY_NEW_GROUP_REQUEST" }, { transaction });
      } catch (err) {
        console.warn(`Falha ao cancelar pagamento pendente ${p.id}:`, err.message);
      }
    }

    // 10. Get or create Asaas customer
    let customer;
    try {
      customer = await ensureAsaasCustomerService(user.id);
    } catch (customerError) {
      await transaction.rollback();
      return {
        code: 400,
        message: customerError.message,
        success: false,
      };
    }

    // 11. Create payment in Asaas
    const method = normalizeMethod(payload.method);
    const billingType = billingTypeForMethod(method);
    const dueDate = method === "BOLETO" ? dayjs().add(BOLETO_DAYS_TO_DUE, "day") : dayjs();
    const expiresAt = method === "PIX" ? dayjs().add(EXPIRATION_MINUTES, "minute") : null;
    const description = payload.description || `Pagamento ${paymentGroup.name} - ${steps.length} etapa(s)`;

    const paymentPayload = {
      customer: customer.asaas_customer_id,
      billingType,
      value: totalAmount,
      dueDate: dueDate.format("YYYY-MM-DD"),
      description,
      externalReference: `group-${groupId}-ticket-${ticket.id}-${method.toLowerCase()}`,
    };

    let paymentData;
    try {
      const paymentResponse = await asaasClient.post("/payments", paymentPayload);
      paymentData = paymentResponse.data;
    } catch (err) {
      await transaction.rollback();
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

    // 12. Get PIX QR Code if needed
    let pixData = null;
    if (method === "PIX") {
      try {
        const pixResponse = await asaasClient.get(`/payments/${paymentData.id}/pixQrCode`);
        pixData = pixResponse.data || {};
      } catch (pixErr) {
        console.warn("Falha ao obter QRCode PIX no Asaas:", pixErr?.response?.data || pixErr);
      }
    }

    // 13. Create payment records for each step
    const paymentRecords = [];
    for (const step of steps) {
      const payment = await Payment.create({
        step_id: step.id,
        ticket_id: ticket.id,
        contractor_id: user.id,
        provider_id: ticket.provider_id,
        amount: step.price, // Individual step amount
        currency: "BRL",
        status: paymentData.status || "PENDING",
        method,
        asaas_payment_id: paymentData.id, // Same Asaas payment for all steps
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
        attempt: 1,
        last_event: "GROUP_PAYMENT_CREATED",
      }, { transaction });

      paymentRecords.push(payment);
    }

    await transaction.commit();

    // 14. Prepare response
    const data = {
      group_id: groupId,
      group_name: paymentGroup.name,
      payment_id: paymentRecords[0].id,
      asaas_payment_id: paymentData.id,
      status: paymentData.status,
      amount: totalAmount,
      steps_count: steps.length,
      step_ids: steps.map(s => s.id),
      ticket_id: ticket.id,
      method,
      invoice_url: paymentData.invoiceUrl,
      checkout_url: paymentData.invoiceUrl,
    };

    if (method === "PIX") {
      data.pix = {
        copy_and_paste: pixData?.payload,
        qr_code_image: pixData?.encodedImage,
        expires_at: pixData?.expirationDate ? dayjs(pixData.expirationDate).toISOString() : undefined,
      };
    }

    if (method === "BOLETO") {
      data.boleto = {
        digitable_line: paymentData?.identificationField,
        pdf_url: paymentData?.bankSlipUrl || paymentData.invoiceUrl,
        due_date: paymentData?.dueDate ? dayjs(paymentData.dueDate).toISOString() : undefined,
      };
    }

    const successMessage =
      method === "PIX"
        ? `Cobrança PIX gerada para ${paymentGroup.name}`
        : method === "BOLETO"
          ? `Boleto gerado para ${paymentGroup.name}`
          : `Link para pagamento gerado para ${paymentGroup.name}`;

    const result = {
      code: 201,
      message: successMessage,
      success: true,
      data,
    };

    // Save idempotency
    if (idempotencyKey) {
      try {
        await PaymentRequest.upsert({
          idempotency_key: idempotencyKey,
          user_id: user.id,
          status: 'completed',
          response: JSON.stringify(result)
        });
      } catch (upsertError) {
        console.error('[createGroupPaymentService] Erro ao salvar idempotency:', upsertError);
      }
    }

    return result;
  } catch (error) {
    await transaction.rollback();
    console.error("[createGroupPaymentService] erro ao criar pagamento:", error?.response?.data || error);

    // Save failure
    if (idempotencyKey) {
      try {
        await PaymentRequest.upsert({
          idempotency_key: idempotencyKey,
          user_id: user.id,
          status: 'failed',
          error_message: error?.message || 'Erro desconhecido'
        });
      } catch (upsertError) {
        console.error('[createGroupPaymentService] Erro ao salvar falha de idempotency:', upsertError);
      }
    }

    const message =
      error?.response?.data?.message ||
      (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.length
        ? error.response.data.errors.map((e) => e?.description || e?.code).join(" | ")
        : null) ||
      error?.message ||
      "Erro interno ao criar pagamento do grupo";
    return {
      code: 400,
      success: false,
      message,
    };
  }
};

module.exports = createGroupPaymentService;
