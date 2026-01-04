const updateTicketService = require("../../services/ticketService/updateTicketService");

const updateTicketController = async (req, res) => {
  try {
    const ticket = await updateTicketService(
      req.params.id,
      req.ticket,
      req.user
    );

    return res.status(ticket.code).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "updateTicketController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateTicketController",
      success: false,
    });
  }
};

module.exports = updateTicketController;
