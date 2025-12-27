const deleteTicketService = require("../../services/ticketService/deleteTicketService");

const deleteTicketController = async (req, res) => {
  try {
    const result = await deleteTicketService(req.params.id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "deleteTicketController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no deleteTicketController",
      success: false,
    });
  }
};

module.exports = deleteTicketController;
