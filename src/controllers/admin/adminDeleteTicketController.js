const adminDeleteTicketService = require("../../services/admin/adminDeleteTicketService");

const adminDeleteTicketController = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = await adminDeleteTicketService(ticketId);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[adminDeleteTicketController] erro:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro ao remover ticket",
    });
  }
};

module.exports = adminDeleteTicketController;
