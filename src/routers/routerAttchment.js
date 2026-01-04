const { Router } = require("express");
const authToken = require("../middlewares/validators/authToken");
const getAttchmentTicketController = require("../controllers/attchment/getAttchmentTicketController");
const updateSignatureAttachmentController = require("../controllers/attchment/updateSignatureAttachmentController");
const updateSignatureAttachmentValidator = require("../middlewares/validators/attachament/updateSignatureAttachamentValidator");
const router = Router();

/**
 * @swagger
 *  /attchment/ticket/{id}:
 *   get:
 *     tags:
 *       - Attchment
 *     summary: Listar anexos de um ticket
 *     description: Retorna todos os anexos vinculados a um ticket específico.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket
 *         example: 45
 *     responses:
 *       200:
 *         description: Lista de anexos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket_id:
 *                   type: integer
 *                   example: 45
 *                 attachments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       filePath:
 *                         type: string
 *                         example: "/uploads/ticket45/contrato.pdf"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-22T10:15:30.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *       404:
 *         description: Ticket não encontrado ou sem anexos
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/ticket/:id", authToken, getAttchmentTicketController);

/**
 * @swagger
 * /attchment/ticket/{id}:
 *   patch:
 *     summary: Atualiza a assinatura de um anexo (attachment) de ticket
 *     description: Permite ao contratante atualizar o campo de assinatura de um anexo associado a um ticket.
 *     tags:
 *       - Attchment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do attachment que será atualizado
 *         schema:
 *           type: integer
 *           example: 45
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: boolean
 *                 description: Define se o attachment foi assinado
 *                 example: true
 *               password:
 *                 type: string
 *                 description: Senha do contratante para validar a operação
 *                 example: "senhaDoContratante123"
 *     responses:
 *       200:
 *         description: Assinatura do attachment atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Assinatura do attachment atualizada com sucesso."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 45
 *                     signature:
 *                       type: boolean
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-24T21:10:00.000Z"
 *       400:
 *         description: Erro de validação no corpo da requisição
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       403:
 *         description: Apenas usuários contratantes podem atualizar a assinatura
 *       404:
 *         description: Attachment não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

router.patch(
  "/ticket/:id",
  authToken,
  updateSignatureAttachmentValidator,
  updateSignatureAttachmentController
);

module.exports = router;
