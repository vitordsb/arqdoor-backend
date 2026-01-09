const createGroupedPaymentService = require("../../services/payment/createGroupedPaymentService");

const createGroupedPaymentController = async (req, res) => {
  const { step_ids, method, description } = req.body;
  const { user } = req;

  try {
    const result = await createGroupedPaymentService(step_ids, user, { method, description });
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[createGroupedPaymentController] Error:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro interno ao criar pagamento agrupado.",
      error: {
        details: [{ message: error.message }],
      },
    });
  }
};

module.exports = createGroupedPaymentController;