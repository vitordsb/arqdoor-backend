const Conversation = require("../../models/Conversation");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const updateTicketTotal = require("../../utils/updateTIcketTotal");

const getAllStepService = async (ticket_id, user) => {
  try {
    // buscar o ticket
    const ticket = await TicketService.findByPk(ticket_id);
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

    // buscar todas as etapas
    const steps = await Step.findAll({ where: { ticket_id: ticket.id } });

    await updateTicketTotal(ticket);


    return {
      code: 200,
      message: "todas as etapas desse ticket",
      success: true,
      steps,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllStepService;
