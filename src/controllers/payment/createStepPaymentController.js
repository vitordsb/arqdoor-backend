const createStepPaymentService = require("../../services/payment/createStepPaymentService");

const createStepPaymentController = async (req, res) => {
  try {
    const result = await createStepPaymentService(
      req.stepId,
      req.stepPaymentPayload || req.paymentPayload || {},
      req.user
    );
    if (!result.success) {
      return res.status(result.code).json(result);
    }
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[createStepPaymentController] erro:", error?.response?.data || error);
    return res.status(400).json({
      code: 400,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Erro interno ao criar pagamento",
      success: false,
    });
  }
};

module.exports = createStepPaymentController;
