const dayjs = require("dayjs");
const asaasClient = require("../../config/asaas");
const Payment = require("../../models/Payment");
const TicketService = require("../../models/TicketService");
const Step = require("../../models/Step");
const PaymentStep = require("../../models/PaymentStep");
const { isPaidStatus } = require("../../utils/asaasStatuses");
const { updateTicketPaymentStatus } = require("../../utils/updateTicketPaymentStatus");
const { Op } = require("sequelize");

const refreshStepPaymentService = async (stepId, user) => {
  try {
    const directPayments = await Payment.findAll({
      where: { step_id: stepId },
      order: [["created_at", "DESC"]],
    });

    const paymentSteps = await PaymentStep.findAll({
      where: { step_id: stepId },
    });
    const groupedPaymentIds = paymentSteps.map((ps) => ps.payment_id);
    
    let groupedPayments = [];
    if (groupedPaymentIds.length > 0) {
      groupedPayments = await Payment.findAll({
        where: { id: { [Op.in]: groupedPaymentIds } },
        order: [["created_at", "DESC"]],
      });
    }

    const payments = [...directPayments, ...groupedPayments].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (!payments || payments.length === 0) {
      return {
        code: 404,
        success: false,
        message: "Nenhum pagamento associado a esta etapa.",
      };
    }

    if (user && user.type !== "contratante" && user.type !== "prestador") {
      return {
        code: 403,
        success: false,
        message: "Usuário sem permissão para consultar este pagamento.",
      };
    }

    const asaasBaseUrl = asaasClient?.defaults?.baseURL;

    let paidPayment = payments.find((p) => isPaidStatus(p.status));
    let stepIdsForRefresh = [stepId];

    if (!paidPayment) {
      const pendingPayments = payments.filter((p) => !isPaidStatus(p.status));

      for (const payment of pendingPayments) {
        if (!payment.asaas_payment_id) continue;

        try {
          console.log(`[Refresh Step] Consultando Asaas (${asaasBaseUrl}) para pagamento ${payment.id} (${payment.asaas_payment_id})`);
          const response = await asaasClient.get(`/payments/${payment.asaas_payment_id}`);
          const data = response.data || {};

          const updateData = {
            status: data.status || payment.status,
            last_event: data.status || payment.last_event,
            raw_response: JSON.stringify(data),
          };

          if (data.paymentDate || data.clientPaymentDate) {
            const paidDate = data.clientPaymentDate || data.paymentDate;
            updateData.paid_at = dayjs(paidDate).toDate();
          }

          if (data.dueDate) {
            updateData.due_date = dayjs(data.dueDate).toDate();
          }

          await payment.update(updateData);

          if (isPaidStatus(updateData.status)) {
            paidPayment = payment;
            break;
          }
        } catch (err) {
          const errorStatus = err?.response?.status;
          const errorData = err?.response?.data;
          console.warn(
            `Erro ao atualizar pagamento ${payment.id} no Asaas:`,
            errorStatus ? `status=${errorStatus}` : "",
            errorData || err.message
          );
        }
      }
    }

    const paid = !!paidPayment && isPaidStatus(paidPayment.status);

    if (paid && paidPayment) {
      const stepIdsToUpdate = [];

      if (paidPayment.step_id) {
        stepIdsToUpdate.push(paidPayment.step_id);
      }
      else {
        const linkedSteps = await PaymentStep.findAll({ where: { payment_id: paidPayment.id } });
        linkedSteps.forEach((ls) => stepIdsToUpdate.push(ls.step_id));
      }

      if (stepIdsToUpdate.length > 0) {
        stepIdsForRefresh = stepIdsToUpdate;
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

    if (paid && stepIdsForRefresh.length > 0) {
      await Step.update(
        { is_financially_cleared: true },
        { where: { id: { [Op.in]: stepIdsForRefresh } } }
      );

      if (paidPayment?.ticket_id) {
        try {
          const ticket = await TicketService.findByPk(paidPayment.ticket_id);
          const paymentPreference = (ticket?.payment_preference || "")
            .toString()
            .toLowerCase();
          if (ticket && paymentPreference === "custom") {
            const stepsToUpdate = await Step.findAll({
              where: { id: { [Op.in]: stepIdsForRefresh } },
            });
            const now = dayjs();
            for (const step of stepsToUpdate) {
              const status = (step.status || "").toString().toLowerCase();
              if (status !== "pendente") continue;
              const start = dayjs(step.start_date);
              const end = dayjs(step.end_date);
              const durationDays =
                start.isValid() && end.isValid()
                  ? Math.max(1, end.diff(start, "day") || 1)
                  : 1;
              const newStart = now.toDate();
              const newEnd = now.add(durationDays, "day").toDate();
              await step.update({
                start_date: newStart,
                end_date: newEnd,
              });
            }
          }
        } catch (e) {
          console.warn(
            "Falha ao atualizar datas das etapas no modo personalizado:",
            e?.message || e
          );
        }
      }
    }

    if (paidPayment?.ticket_id) {
      try {
        await updateTicketPaymentStatus(paidPayment.ticket_id);
      } catch (e) {
        console.warn(
          "Falha ao atualizar status de pagamento do ticket:",
          e?.message || e
        );
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
