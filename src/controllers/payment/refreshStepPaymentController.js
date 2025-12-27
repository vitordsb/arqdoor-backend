const refreshStepPaymentService = require("../../services/payment/refreshStepPaymentService");

const refreshStepPaymentController = async (req, res) => {
  try {
    const result = await refreshStepPaymentService(req.params.stepId, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[refreshStepPaymentController] erro:", error?.response?.data || error);
    return res.status(400).json({
      code: 400,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar pagamento da etapa",
      success: false,
    });
  }
};

module.exports = refreshStepPaymentController;
