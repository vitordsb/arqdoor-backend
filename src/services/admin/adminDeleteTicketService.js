const TicketService = require("../../models/TicketService");
const Step = require("../../models/Step");
const Payment = require("../../models/Payment");

const adminDeleteTicketService = async (ticketId) => {
  try {
    const ticket = await TicketService.findByPk(ticketId);
    if (!ticket) {
      return {
        code: 404,
        success: false,
        message: "Ticket não encontrado",
      };
    }

    // Remove pagamentos vinculados
    await Payment.destroy({ where: { ticket_id: ticket.id } });
    // Remove etapas vinculadas
    await Step.destroy({ where: { ticket_id: ticket.id } });
    // Remove o ticket
    await ticket.destroy();

    return {
      code: 200,
      success: true,
      message: "Ticket removido pelo administrador",
    };
  } catch (error) {
    console.error("[adminDeleteTicketService] erro:", error);
    throw new Error(error.message || "Erro ao remover ticket");
  }
};

module.exports = adminDeleteTicketService;
