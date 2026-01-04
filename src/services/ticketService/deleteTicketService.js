
const ServiceProvider = require("../../models/ServiceProvider");
const TicketService = require("../../models/TicketService");

const deleteTicketService = async (ticket_id, user) => {
  try {
    // Buscando o ticket
    const ticket = await TicketService.findByPk(ticket_id);
    if (!ticket) {
      return {
        code: 404,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    const userProvider = await ServiceProvider.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!userProvider) {
      return {
        code: 404,
        message: "userProvider não encontrado",
        success: false,
      };
    }

    if (userProvider.provider_id !== ticket.provider_id) {
      return {
        code: 400,
        message: "Apenas o 'dono' do ticket pode deleta-lo",
        success: false,
      };
    }

    // validar se o ticket não está em andamento
    if (ticket.status === "em andamento") {
      return {
        code: 400,
        message: "Não é possivel deletar o ticket em andamento",
        success: false,
      };
    }

    await ticket.destroy();

    return {
      code: 200,
      message: "Ticket deletado",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteTicketService;
