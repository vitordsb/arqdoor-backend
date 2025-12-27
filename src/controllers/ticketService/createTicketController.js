const createTicketService = require("../../services/ticketService/createTicketService");

const createTicketController = async (req, res) => {
  try {
    const ticket = await createTicketService(req.ticket, req.user);
    return res.status(ticket.code).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "createTicketController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createTicketController",
      success: false,
    });
  }
};

module.exports = createTicketController;
