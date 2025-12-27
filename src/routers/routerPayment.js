const { Router } = require("express");
const createStepPaymentController = require("../controllers/payment/createStepPaymentController");
const createTicketDepositPaymentController = require("../controllers/payment/createTicketDepositPaymentController");
const getStepPaymentsController = require("../controllers/payment/getStepPaymentsController");
const handleAsaasWebhookController = require("../controllers/payment/handleAsaasWebhookController");
const refreshTicketPaymentController = require("../controllers/payment/refreshTicketPaymentController");
const refreshStepPaymentController = require("../controllers/payment/refreshStepPaymentController");
const authToken = require("../middlewares/validators/authToken");
const createStepPaymentValidator = require("../middlewares/validators/payment/createStepPaymentValidator");
const stepIdParamValidator = require("../middlewares/validators/payment/stepIdParamValidator");
const ticketIdParamValidator = require("../middlewares/validators/payment/ticketIdParamValidator");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Operações relacionadas aos pagamentos das etapas
 */

/**
 * @swagger
 * /payments/steps/{stepId}:
 *   post:
 *     summary: Gera uma cobrança PIX para uma etapa concluída
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da etapa que será paga
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreateRequest'
 *     responses:
 *       201:
 *         description: Cobrança criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentPixSuccessResponse'
 *       400:
 *         description: Dados inválidos ou etapa não elegível
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Etapa ou ticket não encontrado
 */
router.post(
  "/steps/:stepId",
  authToken,
  stepIdParamValidator,
  createStepPaymentValidator,
  createStepPaymentController
);

/**
 * @swagger
 * /payments/steps/{stepId}:
 *   get:
 *     summary: Lista todas as cobranças geradas para uma etapa
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da etapa
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentHistoryResponse'
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Etapa não encontrada
 */
router.get(
  "/steps/:stepId",
  authToken,
  stepIdParamValidator,
  getStepPaymentsController
);

router.get(
  "/steps/:stepId/refresh",
  authToken,
  stepIdParamValidator,
  refreshStepPaymentController
);

/**
 * @swagger
 * /payments/tickets/{ticketId}:
 *   post:
 *     summary: Gera cobrança PIX do valor total do contrato (depósito em garantia)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     responses:
 *       201:
 *         description: Cobrança criada com sucesso
 *       400:
 *         description: Dados inválidos ou contrato não elegível
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Ticket não encontrado
 */
router.post(
  "/tickets/:ticketId",
  authToken,
  ticketIdParamValidator,
  createStepPaymentValidator,
  createTicketDepositPaymentController
);

router.get(
  "/tickets/:ticketId/refresh",
  authToken,
  ticketIdParamValidator,
  refreshTicketPaymentController
);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Endpoint para receber notificações do Asaas
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentWebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook processado
 */
router.post("/webhook", handleAsaasWebhookController);

module.exports = router;
