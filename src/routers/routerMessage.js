const { Router } = require("express");
const createMessageController = require("../controllers/message/createMessageController");
const createMessageValidator = require("../middlewares/validators/message/createMessageValidator");
const authToken = require("../middlewares/validators/authToken");
const getAllMessageController = require("../controllers/message/getAllMessageController");
const getOneMessageController = require("../controllers/message/getOneMessageController");
const updateMessageController = require("../controllers/message/updateMessageController");
const updateMessageValidator = require("../middlewares/validators/message/updateMessageValidator");
const router = Router();

/**
 * @swagger
 * /message/:
 *   post:
 *     summary: Cria uma nova mensagem em uma conversa
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation_id
 *               - content
 *             properties:
 *               conversation_id:
 *                 type: integer
 *                 example: 5
 *               content:
 *                 type: string
 *                 example: Olá, tudo bem?
 *     responses:
 *       201:
 *         description: Mensagem criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */

router.post("/", authToken, createMessageValidator, createMessageController);

/**
 * @swagger
 * /message/conversation/{id}:
 *   get:
 *     summary: Retorna todas as mensagens de uma conversa
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da conversa
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mensagens retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Conversa não encontrada
 */

router.get("/conversation/:id", authToken, getAllMessageController);

/**
 * @swagger
 * /message/{id}:
 *   get:
 *     summary: Retorna uma mensagem específica pelo ID
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da mensagem
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mensagem retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Mensagem não encontrada
 */

router.get("/:id", authToken, getOneMessageController);

/**
 * @swagger
 * /message/{id}:
 *   put:
 *     summary: Atualiza uma mensagem específica pelo ID
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da mensagem
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Mensagem atualizada
 *     responses:
 *       200:
 *         description: Mensagem atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Mensagem não encontrada
 */

router.put("/:id", authToken, updateMessageValidator, updateMessageController);

module.exports = router;
