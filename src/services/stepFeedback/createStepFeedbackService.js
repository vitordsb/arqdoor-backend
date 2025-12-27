const Conversation = require("../../models/Conversation");
const Step = require("../../models/Step");
const StepFeedback = require("../../models/StepFeedback");
const TicketService = require("../../models/TicketService");

const createStepFeedbackService = async (step_id, { comment, type }, user) => {
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

    if (user.type !== "contratante") {
      return {
        code: 400,
        message: "Apenas o contratante pode abrir um feedback",
        success: false,
      };
    }

    // O botão "relatar problema" deve enviar type = "issue".
    const normalizedType = type === "issue" ? "issue" : "feedback";

    const feedback = await StepFeedback.create({
      step_id,
      comment,
      type: normalizedType,
    });

    // Se for um problema relatado, fazemos rollback para o prestador refazer
    if (normalizedType === "issue") {
      await step.update({
        confirm_freelancer: false,
        confirm_contractor: false,
        status: "Pendente",
      });
    }

    return {
      code: 201,
      message: "feedback criado com sucesso",
      success: true,
      feedback,
      step,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createStepFeedbackService;
