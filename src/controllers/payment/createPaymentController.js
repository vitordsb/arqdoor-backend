const createStepPaymentService = require("../../services/payment/createStepPaymentService");
const createGroupedPaymentService = require("../../services/payment/createGroupedPaymentService");

const createPaymentController = async (req, res) => {
  const { step_id, step_ids, method, description } = req.body;
  const { user } = req;

  try {
    let result;

    // Se houver um array de IDs, processa como pagamento agrupado
    if (step_ids && Array.isArray(step_ids) && step_ids.length > 0) {
      result = await createGroupedPaymentService(step_ids, user, { method, description });
    } 
    // Se houver apenas um ID, processa como pagamento individual (legado/padrão)
    else if (step_id) {
      result = await createStepPaymentService(step_id, { method, description }, user);
    } 
    else {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "É necessário fornecer 'step_id' (para individual) ou 'step_ids' (para agrupado).",
      });
    }

    return res.status(result.code).json(result);
  } catch (error) {
    console.error("[createPaymentController] Error:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro interno ao criar pagamento.",
    });
  }
};

module.exports = createPaymentController;