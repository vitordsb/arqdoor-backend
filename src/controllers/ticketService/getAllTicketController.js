const getAllTicketService = require("../../services/ticketService/getAllTicketService");

const getAllTicketController = async (req, res) => {
  try {
    const tickets = await getAllTicketService(req.params.id, req.user);
    return res.status(tickets.code).json(tickets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getAllTicketController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllTicketController",
      success: false,
    });
  }
};

module.exports = getAllTicketController;
