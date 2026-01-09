const refreshTicketPaymentService = require("../../services/payment/refreshTicketPaymentService");

const refreshTicketPaymentController = async (req, res) => {
  const { ticketId } = req.params;
  const { user } = req;

  try {
    const result = await refreshTicketPaymentService(ticketId, user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[refreshTicketPaymentController] Error:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro interno ao atualizar pagamentos do ticket.",
      error: {
        details: [{ message: error.message }],
      },
    });
  }
};

module.exports = refreshTicketPaymentController;