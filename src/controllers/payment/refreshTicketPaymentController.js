const refreshTicketPaymentService = require("../../services/payment/refreshTicketPaymentService");

const refreshTicketPaymentController = async (req, res) => {
  try {
    const result = await refreshTicketPaymentService(req.ticketId, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro interno ao consultar pagamento",
      success: false,
    });
  }
};

module.exports = refreshTicketPaymentController;
