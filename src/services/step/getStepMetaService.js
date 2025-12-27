const Conversation = require("../../models/Conversation");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");

const getStepMetaService = async (stepId, user) => {
  try {
    const step = await Step.findByPk(stepId);
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

    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation) {
      return {
        code: 404,
        message: "Conversa não encontrada",
        success: false,
      };
    }

    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 403,
        message: "O usuário não faz parte desta conversa",
        success: false,
      };
    }

    return {
      code: 200,
      success: true,
      message: "Etapa encontrada",
      data: {
        step,
        ticket_id: ticket.id,
        ticket,
        conversation_id: conversation.conversation_id,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getStepMetaService;
