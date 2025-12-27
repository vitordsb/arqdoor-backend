const Conversation = require("../../models/Conversation");
const TicketAttchment = require("../../models/TicketAttachment");
const TicketService = require("../../models/TicketService");

const getAttchmentTicketService = async (ticket_id, user) => {
  try {
    const ticket = await TicketService.findByPk(ticket_id);
    if (!ticket) {
      return {
        code: 400,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    // validar se conversation existe
    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation) {
      return {
        code: 404,
        message: "Conversa não encontrada",
        success: false,
      };
    }

    // validar se o user logado faz parte da conversa
    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 400,
        message: "O usuario logado não está nessa conversa",
        success: false,
      };
    }

    const attchments = await TicketAttchment.findAll({
      where: {
        ticket_id: ticket.id,
      },
    });

    return {
      code: 200,
      message: "Todos os anexos do ticket",
      success: true,
      attchments,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAttchmentTicketService;
