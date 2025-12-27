const handleAsaasWebhookService = require("../../services/payment/handleAsaasWebhookService");

const handleAsaasWebhookController = async (req, res) => {
  try {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

    if (expectedToken) {
      // Asaas permite token na URL ou em headers; checamos variantes comuns
      const tokenFromQuery = req.query.token;
      const tokenFromHeaders =
        req.headers["x-asaas-token"] ||
        req.headers["asaas-access-token"] ||
        req.headers["authorization"];

      const provided =
        (Array.isArray(tokenFromHeaders) ? tokenFromHeaders[0] : tokenFromHeaders) ||
        (Array.isArray(tokenFromQuery) ? tokenFromQuery[0] : tokenFromQuery);

      if (!provided || provided !== expectedToken) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Token do webhook inválido",
        });
      }
    }

    const result = await handleAsaasWebhookService(req.body);

    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro ao processar o webhook do Asaas",
      success: false,
    });
  }
};

module.exports = handleAsaasWebhookController;
