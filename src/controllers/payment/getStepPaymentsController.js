const getStepPaymentsService = require("../../services/payment/getStepPaymentsService");

const getStepPaymentsController = async (req, res) => {
  try {
    const result = await getStepPaymentsService(req.stepId, req.user);

    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro interno ao consultar pagamentos",
      success: false,
    });
  }
};

module.exports = getStepPaymentsController;
