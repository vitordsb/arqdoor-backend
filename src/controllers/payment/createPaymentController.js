const crypto = require("crypto");
const createStepPaymentService = require("../../services/payment/createStepPaymentService");
const createGroupedPaymentService = require("../../services/payment/createGroupedPaymentService");

const createPaymentController = async (req, res) => {
  const { step_id, step_ids, method, description } = req.body;
  const { user } = req;

  try {
    // ===== IDEMPOTÊNCIA: Gerar ou extrair chave =====
    // Prioridade: header > body > gerado automaticamente
    let idempotencyKey =
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      req.body.idempotency_key;

    // Se não fornecido, gerar automaticamente baseado em step_id/step_ids + user_id
    if (!idempotencyKey) {
      const identifier = step_id || (step_ids && step_ids.join('-')) || 'unknown';
      const timestamp = Date.now();
      const random = crypto.randomBytes(8).toString('hex');
      idempotencyKey = `payment-${user.id}-${identifier}-${timestamp}-${random}`;
      console.log(`[createPaymentController] Idempotency key gerada: ${idempotencyKey}`);
    } else {
      console.log(`[createPaymentController] Idempotency key fornecida: ${idempotencyKey}`);
    }

    let result;

    // Se houver um array de IDs, processa como pagamento agrupado
    if (step_ids && Array.isArray(step_ids) && step_ids.length > 0) {
      result = await createGroupedPaymentService(step_ids, user, { method, description, idempotencyKey });
    } 
    // Se houver apenas um ID, processa como pagamento individual (legado/padrão)
    else if (step_id) {
      result = await createStepPaymentService(step_id, { method, description }, user, idempotencyKey);
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