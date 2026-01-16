const { Router } = require("express");
const authToken = require("../middlewares/validators/authToken");
const createPaymentGroupController = require("../controllers/paymentGroup/createPaymentGroupController");

const router = Router();

/**
 * @swagger
 * /payment-groups:
 *   post:
 *     summary: Cria um novo grupo de pagamento para um ticket
 *     tags: [PaymentGroup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticket_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               sequence:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Grupo criado com sucesso
 *       404:
 *         description: Ticket não encontrado
 */
router.post("/", authToken, createPaymentGroupController);

module.exports = router;