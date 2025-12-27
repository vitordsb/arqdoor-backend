const Conversation = require("../../models/Conversation");
const TicketService = require("../../models/TicketService");

const updateTicketService = async (ticket_id, dataUpdate, user) => {
  try {

    //dataUpdate
        // status
        // signature
        // payment 

    // Buscando o ticket
    const ticket = await TicketService.findByPk(ticket_id);
    if (!ticket) {
      return {
        code: 404,
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

    

    // atualizar os campos
    await ticket.update(dataUpdate);

    return {
      code: 200,
      message: "Ticket atualizado com sucesso",
      success: true,
      ticket,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateTicketService;
