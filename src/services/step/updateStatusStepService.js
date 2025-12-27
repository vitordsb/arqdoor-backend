const Conversation = require("../../models/Conversation");
const ServiceProvider = require("../../models/ServiceProvider");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const updateTicketTotal = require("../../utils/updateTIcketTotal");
const { Op } = require("sequelize");
const Payment = require("../../models/Payment");
const { SUCCESS_STATUSES } = require("../../utils/asaasStatuses");

const updateStatusStepService = async (step_id, dataUpdate, user) => {
  try {
    const step = await Step.findByPk(step_id);
    if (!step) {
      return {
        code: 404,
        message: "Etapa não encontrada",
        success: false,
      };
    }

    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      return {
        code: 404,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    const userProvider = await ServiceProvider.findByPk(ticket.provider_id);
    if (!userProvider) {
      return {
        code: 404,
        message: "userProvider não encontrado",
        success: false,
      };
    }

    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation) {
      return {
        code: 404,
        message: "Conversa não encontrada",
        success: false,
      };
    }

    // validar se o usuario logado pertence ou faz parte da conversa
    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 400,
        message: "O usuario logado não esta nessa conversa",
        success: false,
      };
    }

    // Bloqueia concluir etapa paga sem pagamento confirmado
    if (
      dataUpdate === "Concluido" &&
      Number(step.price || 0) > 0
    ) {
      const paid = await Payment.findOne({
        where: { step_id: step.id, status: { [Op.in]: SUCCESS_STATUSES } },
      });
      if (!paid) {
        return {
          code: 400,
          message: "Pagamento não confirmado para esta etapa.",
          success: false,
        };
      }
    }

    await step.update({ status: dataUpdate });

    await updateTicketTotal(ticket);

    return {
      code: 200,
      message: "Etapa atualizada com sucesso",
      step,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateStatusStepService;
