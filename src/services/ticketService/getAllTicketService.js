const Conversation = require("../../models/Conversation");
const ServiceProvider = require("../../models/ServiceProvider");
const TicketService = require("../../models/TicketService");
const User = require("../../models/User");
const { updateTicketPaymentStatus } = require("../../utils/updateTicketPaymentStatus");

const getAllTicketService = async (dataTicket, user) => {
  try {
    const userId = Number(user?.id);
    if (!Number.isFinite(userId)) {
      return {
        code: 400,
        message: "Usuário inválido",
        success: false,
      };
    }

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
      Number(conversation.user1_id) !== userId &&
      Number(conversation.user2_id) !== userId
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

    const updatedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const status = await updateTicketPaymentStatus(ticket.id);
          if (status) {
            ticket.payment_status = status;
          }
        } catch (e) {
          console.warn(
            "Falha ao atualizar status de pagamento do ticket:",
            e?.message || e
          );
        }
        return ticket;
      })
    );

    return {
      code: 200,
      message: "Todos os tickets encontrados",
      success: true,
      tickets: updatedTickets,
    };
  } catch (error) {
    throw new Error(error.message);
    console.error(error);
  }
};

module.exports = getAllTicketService;
