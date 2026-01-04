const { Router } = require("express");
const createStepFeedbackValidator = require("../middlewares/validators/stepFeedback/createStepFeedbackValidator");
const createStepFeedbackController = require("../controllers/stepFeedback/createStepFeedbackController");
const authToken = require("../middlewares/validators/authToken");
const getAllStepFeedbackController = require("../controllers/stepFeedback/getAllStepFeedbackController");
const updateStepFeedbackController = require("../controllers/stepFeedback/updateStepFeedbackController");
const deleteStepFeedbackController = require("../controllers/stepFeedback/deleteStepFeedbackController");
const router = Router();

/**
 * @swagger
 * /stepfeedback/{id}:
 *   post:
 *     summary: Cria um feedback para um step
 *     description: Adiciona um comentário de feedback em um step específico.
 *     tags:
 *       - Step Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do step para o qual o feedback será criado
 *         schema:
 *           type: integer
 *           example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Comentário de feedback do contratante ou freelancer
 *                 example: "O trabalho ficou excelente, dentro do prazo!"
 *             required:
 *               - comment
 *     responses:
 *       201:
 *         description: Feedback criado com sucesso
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
 *                   example: "Feedback criado com sucesso."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     step_id:
 *                       type: integer
 *                       example: 12
 *                     comment:
 *                       type: string
 *                       example: "O trabalho ficou excelente, dentro do prazo!"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-07T18:00:00.000Z"
 *       400:
 *         description: Erro de validação no corpo da requisição
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       404:
 *         description: Step não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

router.post(
  "/:id",
  authToken,
  createStepFeedbackValidator,
  createStepFeedbackController
);

/**
 * @swagger
 * /stepfeedback/{id}:
 *   get:
 *     summary: Lista todos os feedbacks de um step
 *     description: Retorna todos os feedbacks associados a um step específico.
 *     tags:
 *       - Step Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do step para listar os feedbacks
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Lista de feedbacks retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       step_id:
 *                         type: integer
 *                         example: 12
 *                       comment:
 *                         type: string
 *                         example: "O freelancer entregou tudo certinho."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-07T18:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-07T18:00:00.000Z"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       404:
 *         description: Step não encontrado ou sem feedbacks
 *       500:
 *         description: Erro interno do servidor
 */

router.get("/:id", authToken, getAllStepFeedbackController);

router.patch("/item/:id", authToken, updateStepFeedbackController);
router.delete("/item/:id", authToken, deleteStepFeedbackController);

module.exports = router;
