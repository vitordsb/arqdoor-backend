const getTicketPaymentGroupsService = require("../../services/ticketService/getTicketPaymentGroupsService");

const getTicketPaymentGroupsController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTicketPaymentGroupsService(id);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[getTicketPaymentGroupsController] Error:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro interno ao buscar grupos de pagamento.",
      error: error.message,
    });
  }
};

module.exports = getTicketPaymentGroupsController;