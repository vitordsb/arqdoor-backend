const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");

const getTicketStepsService = async (ticketId, user) => {
  try {
    const ticket = await TicketService.findByPk(ticketId);
    if (!ticket) {
      return {
        code: 404,
        success: false,
        message: "Ticket não encontrado.",
      };
    }

    const steps = await Step.findAll({
      where: { ticket_id: ticketId },
      order: [["created_at", "ASC"]],
    });

    return {
      code: 200,
      success: true,
      data: steps,
    };
  } catch (error) {
    console.error("[getTicketStepsService] erro:", error);
    return { code: 500, success: false, message: "Erro interno ao buscar as etapas." };
  }
};

module.exports = getTicketStepsService;