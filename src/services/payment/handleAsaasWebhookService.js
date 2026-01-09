const dayjs = require("dayjs");
const Payment = require("../../models/Payment");
const Step = require("../../models/Step");
const PaymentStep = require("../../models/PaymentStep");
const TicketService = require("../../models/TicketService");
const Message = require("../../models/Message");
const { isPaidStatus } = require("../../utils/asaasStatuses");
const refreshStepFinancialClearanceService = require("./refreshStepFinancialClearanceService");

const handleAsaasWebhookService = async (payload) => {
  try {
    const { event, payment } = payload || {};

    console.log(`[Webhook Service] Iniciando processamento. Evento: ${event}, ID Asaas: ${payment?.id}`);

    if (!event || !payment?.id) {
      return { code: 400, success: false, message: "Payload inválido" };
    }

    const currentPayment = await Payment.findOne({
      where: { asaas_payment_id: payment.id },
    });

    if (!currentPayment) {
      console.warn(`[Webhook Service] Pagamento não encontrado no banco para ID Asaas: ${payment.id}`);
      return { code: 404, success: false, message: "Pagamento não encontrado" };
    }

    await currentPayment.update({
      status: payment.status,
      last_event: event,
      paid_at: payment.clientPaymentDate
        ? dayjs(payment.clientPaymentDate).toDate()
        : payment.paymentDate
        ? dayjs(payment.paymentDate).toDate()
        : currentPayment.paid_at,
      raw_response: JSON.stringify(payment),
      webhook_payload: JSON.stringify(payload),
    });

    console.log(`[Webhook Service] Pagamento ${currentPayment.id} atualizado para status: ${payment.status}`);

    const stepIds = [];

    if (currentPayment.step_id) {
      stepIds.push(currentPayment.step_id);
    }

    const linkedSteps = await PaymentStep.findAll({
      where: { payment_id: currentPayment.id },
    });

    linkedSteps.forEach((ls) => stepIds.push(ls.step_id));

    if (stepIds.length === 0) {
      console.warn(`[Webhook Service] Pagamento ${currentPayment.id} confirmado, mas sem etapas vinculadas.`);
      return { code: 200, success: true, message: "Pagamento sem etapas vinculadas" };
    }

    console.log(`[Webhook Service] Avaliando liberacao financeira para etapas: ${stepIds.join(", ")}`);

    const refreshResult = await refreshStepFinancialClearanceService(stepIds, {
      logger: console.log,
    });

    if (!isPaidStatus(payment.status)) {
      console.log(`[Webhook Service] Status ${payment.status} nao e de confirmacao. Encerrando.`);
      return { code: 200, success: true, message: `Pagamento processado (Status: ${payment.status})` };
    }

    const stepsToFinalize = refreshResult.clearedStepIds.length
      ? await Step.findAll({
          where: {
            id: refreshResult.clearedStepIds,
            confirm_freelancer: true,
          },
        })
      : [];

    for (const step of stepsToFinalize) {
      if ((step.status || "").toLowerCase() !== "concluido") {
        await step.update({
          status: "Concluido",
          end_date: dayjs().toDate(),
        });
      }
    }

    if (!currentPayment.ticket_id) {
      return {
        code: 200,
        success: true,
        message: "Pagamento confirmado e etapas liberadas",
      };
    }

    const isDeposit = (currentPayment.description || "")
      .toLowerCase()
      .includes("depósito");

    if (isDeposit) {
      await TicketService.update(
        { status: "em andamento", payment: true },
        { where: { id: currentPayment.ticket_id } }
      );

      const ticket = await TicketService.findByPk(currentPayment.ticket_id);
      if (ticket?.conversation_id) {
        await Message.create({
          conversation_id: ticket.conversation_id,
          sender_id: currentPayment.contractor_id,
          content: "💰 Pagamento do depósito confirmado. Projeto liberado.",
        });
      }
    }

    return {
      code: 200,
      success: true,
      message: "Pagamento processado com sucesso",
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = handleAsaasWebhookService;



