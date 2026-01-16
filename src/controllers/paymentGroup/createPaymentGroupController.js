const createPaymentGroupService = require("../../services/paymentGroup/createPaymentGroupService");

const createPaymentGroupController = async (req, res) => {
  try {
    console.log("Payload recebido no controller de grupo:", req.body);
    const result = await createPaymentGroupService(req.body);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[createPaymentGroupController] Error:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro interno ao criar grupo de pagamento.",
    });
  }
};

module.exports = createPaymentGroupController;