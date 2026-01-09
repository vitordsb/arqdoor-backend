const handleAsaasWebhookService = require("../../services/payment/handleAsaasWebhookService");

const handleAsaasWebhookController = async (req, res) => {
  try {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

    // Log inicial para confirmar que a rota foi atingida
    console.log(`[Webhook Asaas] Recebido POST em /payments/webhook`);

    if (expectedToken) {
      // Asaas permite token na URL ou em headers; checamos variantes comuns
      const tokenFromQuery = req.query.token;
      const tokenFromHeaders =
        req.headers["x-asaas-token"] ||
        req.headers["asaas-access-token"] ||
        req.headers["authorization"] ||
        req.headers["access_token"] ||
        req.headers["access-token"];

      const rawProvided =
        (Array.isArray(tokenFromHeaders) ? tokenFromHeaders[0] : tokenFromHeaders) ||
        (Array.isArray(tokenFromQuery) ? tokenFromQuery[0] : tokenFromQuery);

      const provided =
        typeof rawProvided === "string" && rawProvided.startsWith("Bearer ")
          ? rawProvided.slice(7)
          : rawProvided;

      const providedSource = tokenFromHeaders ? "header" : tokenFromQuery ? "query" : null;

      if (!provided || provided !== expectedToken) {
        console.warn(`[Webhook] Token invalido ou ausente. Fonte: ${providedSource || "none"}.`);
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Token do webhook inválido",
        });
      }
    }

    // Verifica se o body chegou corretamente (middleware express.json)
    if (!req.body || Object.keys(req.body).length === 0) {
      console.warn("[Webhook] Body vazio. Verifique se o middleware express.json() está configurado.");
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Payload vazio ou inválido.",
      });
    }

    // Log resumido para monitoramento
    const { event, payment } = req.body;
    console.log(`[Webhook Asaas] Processando Evento: ${event} | ID Asaas: ${payment?.id}`);

    const result = await handleAsaasWebhookService(req.body);

    // Se o pagamento não for encontrado (404), retornamos 200 para o Asaas parar de tentar reenviar (evita loop de retry)
    if (result.code === 404) {
      return res.status(200).json({
        ...result,
        message: "Webhook recebido, mas pagamento não encontrado (retornando 200 para evitar retries).",
      });
    }

    console.log(`[Webhook Asaas] Sucesso: ${result.message}`);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(`[Webhook Asaas] Erro Crítico:`, error);
    return res.status(500).json({
      code: 500,
      message: "Erro ao processar o webhook do Asaas",
      success: false,
    });
  }
};

module.exports = handleAsaasWebhookController;

