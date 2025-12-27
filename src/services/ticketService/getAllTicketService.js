const Conversation = require("../../models/Conversation");
const ServiceProvider = require("../../models/ServiceProvider");
const TicketService = require("../../models/TicketService");
const User = require("../../models/User");

const getAllTicketService = async (dataTicket, user) => {
  try {

    // validar se conversation existe
    const conversation = await Conversation.findByPk(dataTicket);
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

    const tickets = await TicketService.findAll({
      where: {
        conversation_id: conversation.conversation_id,
      },
    });

    return {
      code: 200,
      message: "Todos os tickets encontrados",
      success: true,
      tickets,
    };
  } catch (error) {
    throw new Error(error.message);
    console.error(error);
  }
};

module.exports = getAllTicketService;
