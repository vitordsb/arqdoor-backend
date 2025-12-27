const createTicketDepositPaymentService = require("../../services/payment/createTicketDepositPaymentService");

const createTicketDepositPaymentController = async (req, res) => {
  try {
    const result = await createTicketDepositPaymentService(
      req.ticketId,
      req.user,
      req.stepPaymentPayload || req.paymentPayload || {}
    );
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro interno ao criar pagamento de depósito",
      success: false,
    });
  }
};

module.exports = createTicketDepositPaymentController;
