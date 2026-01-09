const { Router } = require("express");
const createTicketController = require("../controllers/ticketService/createTicketController");
const createTicketValidator = require("../middlewares/validators/ticketService/createTicketValidator");
const authToken = require("../middlewares/validators/authToken");
const getAllTicketController = require("../controllers/ticketService/getAllTicketController");
const getOneTicketController = require("../controllers/ticketService/getOneTicketController");
const updateTicketController = require("../controllers/ticketService/updateTicketController");
const updateTicketValidator = require("../middlewares/validators/ticketService/updateTicketValidator");
const deleteTicketController = require("../controllers/ticketService/deleteTicketController");
const getProviderActiveTicketsController = require("../controllers/ticketService/getProviderActiveTicketsController");
const updateSignatureTicketValidator = require("../middlewares/validators/step/updateSignatureStepValidator");
const updateSignatureTicketController = require("../controllers/step/updateSignatureStepController");
const getTicketStepsController = require("../controllers/ticketService/getTicketStepsController");
const router = Router();

/**
 * @swagger
 * /ticket:
 *   post:
 *     summary: Cria um novo ticket
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversation_id:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Ticket criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */

router.post("/", authToken, createTicketValidator, createTicketController);

/**
 * @swagger
 * /ticket/conversation/{id}:
 *   get:
 *     summary: Lista todos os tickets de uma conversa
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conversa (conversation_id)
 *     responses:
 *       200:
 *         description: Lista de tickets obtida com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Conversa não encontrada
 */
router.get("/conversation/:id", authToken, getAllTicketController);
router.get("/provider/active", authToken, getProviderActiveTicketsController);

/**
 * @swagger
 * /ticket/{id}:
 *   get:
 *     summary: Retorna um ticket específico
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     responses:
 *       200:
 *         description: Ticket retornado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Ticket não encontrado
 */
router.get("/:id", authToken, getOneTicketController);

/**
 * @swagger
 * /ticket/{id}:
 *   patch:
 *     summary: Atualiza parcialmente os dados de um ticket
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "pendente"
 *               signature:
 *                 type: boolean
 *                 example: true
 *               payment:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Ticket atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Ticket não encontrado
 */
router.patch("/:id", authToken, updateTicketValidator, updateTicketController);

/**
 * @swagger
 * /ticket/{id}:
 *   delete:
 *     tags:
 *       - Ticket
 *     summary: Deletar um ticket
 *     description: Remove permanentemente um ticket pelo seu ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket a ser deletado
 *         example: 12
 *     responses:
 *       200:
 *         description: Ticket deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Ticket removido com sucesso"
 *       401:
 *         description: Token inválido ou não fornecido
 *       404:
 *         description: Ticket não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/:id", authToken, deleteTicketController);

// router.get("/tickets/:id/steps", authToken, getTicketStepsController); 
router.get("/:id/steps", authToken, getTicketStepsController);



module.exports = router;
