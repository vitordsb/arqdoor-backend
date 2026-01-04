const Conversation = require("../../models/Conversation");
const Step = require("../../models/Step");
const StepFeedback = require("../../models/StepFeedback");
const TicketService = require("../../models/TicketService");

const deleteStepFeedbackService = async (feedbackId, user) => {
  try {
    const feedback = await StepFeedback.findByPk(feedbackId);
    if (!feedback) {
      return { code: 404, message: "Feedback não encontrado", success: false };
    }

    const step = await Step.findByPk(feedback.step_id);
    if (!step) {
      return { code: 404, message: "Etapa não encontrada", success: false };
    }

    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      return { code: 404, message: "ticket não encontrado", success: false };
    }

    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation) {
      return { code: 404, message: "Conversa não encontrada", success: false };
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return { code: 400, message: "O usuario logado não esta nessa conversa", success: false };
    }

    if (user.type !== "contratante") {
      return { code: 400, message: "Apenas o contratante pode apagar feedback", success: false };
    }

    await feedback.destroy();
    return { code: 200, message: "Feedback removido", success: true };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteStepFeedbackService;
