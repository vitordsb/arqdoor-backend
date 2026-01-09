const confirmStepPaymentService = require("../../services/step/confirmStepPaymentService");

const confirmStepPaymentController = async (req, res) => {
  try {
    const result = await confirmStepPaymentService(req.params.stepId, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[confirmStepPaymentController] erro:", error?.response?.data || error);
    return res.status(400).json({
      code: 400,
      message: error?.message || "Erro ao confirmar pagamento da etapa",
      success: false,
    });
  }
};

module.exports = confirmStepPaymentController;
