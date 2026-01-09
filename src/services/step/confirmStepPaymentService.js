const { Op, fn, col, where } = require("sequelize");
const sequelize = require("../../database/config");
const Conversation = require("../../models/Conversation");
const Payment = require("../../models/Payment");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const { SUCCESS_STATUSES } = require("../../utils/asaasStatuses");

const confirmStepPaymentService = async (stepId, user) => {
  try {
    const result = await sequelize.transaction(async (transaction) => {
      const step = await Step.findByPk(stepId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!step) {
        return {
          code: 404,
          success: false,
          message: "Etapa nao encontrada",
        };
      }

      const ticket = await TicketService.findByPk(step.ticket_id, { transaction });
      if (!ticket) {
        return {
          code: 404,
          success: false,
          message: "Ticket nao encontrado",
        };
      }

      const conversation = await Conversation.findByPk(ticket.conversation_id, { transaction });
      if (!conversation) {
        return {
          code: 404,
          success: false,
          message: "Conversa nao encontrada",
        };
      }

      if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
        return {
          code: 403,
          success: false,
          message: "O usuario nao participa desta conversa",
        };
      }

      if ((user.type || "").toLowerCase() !== "contratante") {
        return {
          code: 403,
          success: false,
          message: "Apenas o contratante pode confirmar o pagamento da etapa",
        };
      }

      if (step.is_financially_cleared) {
        return {
          code: 200,
          success: true,
          message: "Etapa ja liberada financeiramente",
          data: { step_id: step.id },
        };
      }

      // Requer paid_at + status final no banco para liberar a etapa.
      const paidPayment = await Payment.findOne({
        where: {
          step_id: step.id,
          paid_at: { [Op.ne]: null },
          [Op.and]: where(
            fn("UPPER", fn("TRIM", col("status"))),
            { [Op.in]: SUCCESS_STATUSES }
          ),
        },
        order: [["paid_at", "DESC"]],
        transaction,
      });

      if (!paidPayment) {
        console.warn(
          `[confirmStepPaymentService] Sem pagamento confirmado para step=${step.id}`
        );
        return {
          code: 409,
          success: false,
          message: "Pagamento confirmado nao encontrado para esta etapa",
        };
      }

      await step.update(
        {
          is_financially_cleared: true,
          confirm_contractor: true,
        },
        { transaction }
      );

      console.log(
        `[confirmStepPaymentService] Etapa ${step.id} liberada via pagamento ${paidPayment.id}`
      );

      return {
        code: 200,
        success: true,
        message: "Etapa liberada financeiramente",
        data: {
          step_id: step.id,
          payment_id: paidPayment.id,
        },
      };
    });

    return result;
  } catch (error) {
    console.error("[confirmStepPaymentService] erro:", error?.response?.data || error);
    return {
      code: 400,
      success: false,
      message: error?.message || "Erro ao confirmar pagamento da etapa",
    };
  }
};

module.exports = confirmStepPaymentService;
