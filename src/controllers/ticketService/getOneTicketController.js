const getOneTicketService = require("../../services/ticketService/getOneTicketService");

const getOneTicketController = async (req, res) => {
  try {
    const ticket = await getOneTicketService(req.params.id, req.user);
    return res.status(ticket.code).json(ticket);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getOneTicketController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getOneTicketController",
      success: false,
    });
  }
};

module.exports = getOneTicketController;
