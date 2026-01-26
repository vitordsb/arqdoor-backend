const createGroupPaymentService = require("../../services/payment/createGroupPaymentService");

const createGroupPaymentController = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { method, description } = req.body;
    const user = req.user;
    const idempotencyKey = req.headers['idempotency-key'] || null;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "ID do grupo de pagamento é obrigatório",
      });
    }

    const result = await createGroupPaymentService(
      parseInt(groupId),
      { method, description },
      user,
      idempotencyKey
    );

    return res.status(result.code || 200).json(result);
  } catch (error) {
    console.error("[createGroupPaymentController] erro:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erro ao criar pagamento do grupo",
    });
  }
};

module.exports = createGroupPaymentController;
