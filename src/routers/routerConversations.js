const { Router } = require("express");
const createConversationController = require("../controllers/conversation/createConversationController");
const createConversationValidator = require("../middlewares/validators/conversation/createConversationValidator");
const authToken = require("../middlewares/validators/authToken");
const getAllConversationController = require("../controllers/conversation/getAllConversationController");
const router = Router();

/**
 * @swagger
 * /conversation/:
 *   post:
 *     summary: Cria uma nova conversa entre dois usuários
 *     tags: [Conversation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user1_id
 *               - user2_id
 *             properties:
 *               user1_id:
 *                 type: integer
 *                 example: 1
 *               user2_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Conversa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Conversa já existente entre os usuários
 */

router.post("/", createConversationValidator, createConversationController);

/**
 * @swagger
 * /conversation/:
 *   get:
 *     summary: Retorna todas as conversas do usuário autenticado
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user1_id:
 *                     type: integer
 *                     example: 1
 *                   user2_id:
 *                     type: integer
 *                     example: 2
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Não autorizado
 */

router.get("/", authToken, getAllConversationController);

module.exports = router;
