const dayjs = require("dayjs");
const asaasClient = require("../../config/asaas");
const Payment = require("../../models/Payment");
const TicketService = require("../../models/TicketService");
const Step = require("../../models/Step");
const { isPaidStatus } = require("../../utils/asaasStatuses");

const refreshStepPaymentService = async (stepId, user) => {
  try {
    const payments = await Payment.findAll({
      where: { step_id: stepId },
      order: [["created_at", "DESC"]],
    });

    if (!payments || payments.length === 0) {
      return {
        code: 404,
        success: false,
        message: "Nenhum pagamento associado a esta etapa.",
      };
    }

    // garante que usuário pertence ao ticket (prestador ou contratante)
    if (user && user.type !== "contratante" && user.type !== "prestador") {
      return {
        code: 403,
        success: false,
        message: "Usuário sem permissão para consultar este pagamento.",
      };
    }

    let paidPayment = payments.find((p) => isPaidStatus(p.status));

    // Se nenhum pago encontrado, sincroniza o mais recente pendente
    let targetPayment = paidPayment || payments[0];

    if (!paidPayment) {
      const asaaspaymentId = targetPayment.asaas_payment_id;
      if (!asaaspaymentId) {
        return {
          code: 400,
          success: false,
          message: "Pagamento não possui referência no Asaas.",
        };
      }

      const asaaspayment = await asaasClient.get(`/payments/${asaaspaymentId}`);
      const data = asaaspayment.data || {};

      const updateData = {
        status: data.status || targetPayment.status,
        last_event: data.status || targetPayment.last_event,
        raw_response: JSON.stringify(data),
      };

      if (data.paymentDate || data.clientPaymentDate) {
        const paidDate = data.clientPaymentDate || data.paymentDate;
        updateData.paid_at = dayjs(paidDate).toDate();
      }

      if (data.dueDate) {
        updateData.due_date = dayjs(data.dueDate).toDate();
      }

      const wasPaid = isPaidStatus(targetPayment.status);
      await targetPayment.update(updateData);

      if (isPaidStatus(updateData.status)) {
        paidPayment = targetPayment;
      }
    }

    const paid = !!paidPayment && isPaidStatus(paidPayment.status);

    if (paid && paidPayment) {
      if (paidPayment.step_id) {
        try {
          const paidStep = await Step.findByPk(paidPayment.step_id);
          if (paidStep) {
            await paidStep.update({
              status: "Concluido",
              confirm_contractor: true,
            });
          }
        } catch (e) {
          console.warn("Falha ao marcar etapa como concluída após refresh de pagamento", e);
        }
      }
      if (paidPayment.ticket_id) {
        try {
          const steps = await Step.findAll({ where: { ticket_id: paidPayment.ticket_id } });
          const allConcluded = steps.length > 0 && steps.every(
            (s) => (s.status || "").toLowerCase() === "concluido"
          );
          if (allConcluded) {
            await TicketService.update(
              { status: "concluída" },
              { where: { id: paidPayment.ticket_id } }
            );
          }
        } catch (e) {
          console.warn("Falha ao avaliar ticket após refresh de pagamento", e);
        }
      }
    }

    const statusToReturn = paidPayment ? paidPayment.status : (payments[0]?.status || "PENDING");

    return {
      code: 200,
      success: true,
      message: paid ? "Pagamento confirmado" : "Pagamento ainda pendente",
      data: {
        paid,
        status: statusToReturn,
        payment_id: paidPayment?.id || payments[0]?.id,
        asaas_payment_id: paidPayment?.asaas_payment_id || payments[0]?.asaas_payment_id,
      },
    };
  } catch (error) {
    console.error("[refreshStepPaymentService] erro:", error?.response?.data || error);
    const message =
      error?.response?.data?.message ||
      (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.length
        ? error.response.data.errors.map((e) => e?.description || e?.code).join(" | ")
        : null) ||
      error?.message ||
      "Erro ao atualizar pagamento";
    return {
      code: 400,
      success: false,
      message,
    };
  }
};

module.exports = refreshStepPaymentService;
