const Payment = require("../../models/Payment");
const TicketService = require("../../models/TicketService");
const Step = require("../../models/Step");
const PaymentStep = require("../../models/PaymentStep");
const asaasClient = require("../../config/asaas");
const { Op } = require("sequelize");
const { isPaidStatus } = require("../../utils/asaasStatuses");
const refreshStepFinancialClearanceService = require("./refreshStepFinancialClearanceService");

const refreshTicketPaymentService = async (ticketId, user) => {
  try {
    const ticket = await TicketService.findByPk(ticketId);
    if (!ticket) {
      return {
        code: 404,
        success: false,
        message: "Ticket nÃ£o encontrado.",
      };
    }

    const allPayments = await Payment.findAll({
      where: {
        ticket_id: ticketId,
      },
    });

    if (!allPayments || allPayments.length === 0) {
      return {
        code: 200,
        success: true,
        message: "NÃ£o hÃ¡ pagamentos vinculados a este ticket.",
        data: [],
      };
    }
    const updatedPayments = [];
    const asaasBaseUrl = asaasClient?.defaults?.baseURL;

    // Iterar e consultar o gateway (Asaas)
    for (const payment of allPayments) {
      if (!payment.asaas_payment_id) continue;

      try {
        console.log(`[Refresh Service] Consultando Asaas (${asaasBaseUrl}) para pagamento ${payment.id} (${payment.asaas_payment_id})`);
        const response = await asaasClient.get(`/payments/${payment.asaas_payment_id}`);

        const asaasData = response.data;
        let statusChanged = false;

        // Se o status mudou, atualiza no banco
        if (asaasData.status) {
          const previousStatus = payment.status;

          payment.status = asaasData.status;

          if (isPaidStatus(asaasData.status)) {
            if (!payment.paid_at && asaasData.paymentDate) {
              payment.paid_at = asaasData.paymentDate;
            }
          }

          await payment.save();
          console.log(`[Refresh Service] Status do pagamento ${payment.id} atualizado para ${payment.status}`);

          if (previousStatus !== payment.status) {
            updatedPayments.push(payment);
          }
        }

        if (isPaidStatus(payment.status)) {
          const stepIdsToUpdate = [];

          // pagamento individual
          if (payment.step_id) {
            stepIdsToUpdate.push(payment.step_id);
          }

          // pagamento agrupado
          const linkedSteps = await PaymentStep.findAll({
            where: { payment_id: payment.id },
          });
          linkedSteps.forEach((ls) => stepIdsToUpdate.push(ls.step_id));

          if (stepIdsToUpdate.length > 0) {
            console.log(`[Refresh Service] Avaliando liberacao financeira para etapas: ${stepIdsToUpdate.join(", ")}`);
            await refreshStepFinancialClearanceService(stepIdsToUpdate, {
              logger: console.log,
            });
          } else {
            await TicketService.update({ payment: true }, { where: { id: ticketId } });
          }
        } else {
          const stepIdsToCheck = [];
          if (payment.step_id) stepIdsToCheck.push(payment.step_id);

          const linkedSteps = await PaymentStep.findAll({ where: { payment_id: payment.id } });
          linkedSteps.forEach((ls) => stepIdsToCheck.push(ls.step_id));

          if (stepIdsToCheck.length > 0) {
            const countCleared = await Step.count({
              where: {
                id: { [Op.in]: stepIdsToCheck },
                is_financially_cleared: true,
              },
            });

            if (countCleared > 0 && payment.status !== "CANCELLED") {
              payment.status = "CANCELLED";
              await payment.save();
              if (!updatedPayments.find((p) => p.id === payment.id)) {
                updatedPayments.push(payment);
              }
            }
          }
        }

      } catch (err) {
        const errorStatus = err?.response?.status;
        const errorData = err?.response?.data;
        console.error(
          `Erro ao consultar Asaas para pagamento ${payment.id}:`,
          errorStatus ? `status=${errorStatus}` : "",
          errorData || err.message
        );
      }
    }

    return {
      code: 200,
      success: true,
      message: "Status dos pagamentos atualizados com sucesso.",
      data: updatedPayments,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = refreshTicketPaymentService;
