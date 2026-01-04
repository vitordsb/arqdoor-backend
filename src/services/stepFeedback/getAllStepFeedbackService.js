const Conversation = require("../../models/Conversation");
const Step = require("../../models/Step");
const StepFeedback = require("../../models/StepFeedback");
const TicketService = require("../../models/TicketService");

const getAllStepFeedbackService = async (step_id, user) => {
  try {
    const step = await Step.findByPk(step_id);
    if (!step) {
      return {
        code: 404,
        message: "Etapa não encontrada",
        success: false,
      };
    }

    // buscar o ticket
    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      return {
        code: 404,
        message: "ticket não encontrado",
        success: false,
      };
    }

    // validar se o comentario pertence aos usuarios da conversa
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

    const feedbacks = await StepFeedback.findAll({
      where: { step_id: step_id },
    });

    return {
      code: 200,
      message: "Todos os feedbacks desse step",
      success: true,
      feedbacks,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllStepFeedbackService;
