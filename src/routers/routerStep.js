const { Router } = require("express");
const createStepController = require("../controllers/step/createStepController");
const authToken = require("../middlewares/validators/authToken");
const { checkStepOwnership } = require("../middlewares/checkOwnership");
const createStepValidator = require("../middlewares/validators/step/createStepValidator");
const getAllStepController = require("../controllers/step/getAllStepController");
const updateStepValidator = require("../middlewares/validators/step/updateStepValidator");
const updateStepController = require("../controllers/step/updateStepController");
const deleteStepController = require("../controllers/step/deleteStepController");
const updateStatusStepController = require("../controllers/step/updateStatusStepController");
const updateSignatureStepController = require("../controllers/step/updateSignatureStepController");
const updateSignatureStepValidator = require("../middlewares/validators/step/updateSignatureStepValidator");
const updateConfirmFreelancerController = require("../controllers/serviceFreelancer/updateConfirmFreelancerController");
const updateConfirmFreelancerValidator = require("../middlewares/validators/step/updateConfirmFreelancerValidator");
const getStepMetaController = require("../controllers/step/getStepMetaController");

const router = Router();

/**
 * @swagger
 * /step:
 *   post:
 *     summary: Cria uma nova etapa (Step) para um ticket
 *     tags: [Step]
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
 *                 example: 12
 *               title:
 *                 type: string
 *                 example: "Primeira etapa do serviço"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 150.50
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-10T08:00:00.000Z"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-20T18:00:00.000Z"
 *     responses:
 *       201:
 *         description: Step criado com sucesso
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
 *                   example: "Etapa criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     ticket_id:
 *                       type: integer
 *                       example: 12
 *                     title:
 *                       type: string
 *                       example: "Primeira etapa do serviço"
 *                     price:
 *                       type: number
 *                       example: 150.5
 *                     start_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-10T08:00:00.000Z"
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-20T18:00:00.000Z"
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autorizado
 */

router.post("/", authToken, createStepValidator, createStepController);

/**
 * @swagger
 * /step/{id}:
 *   get:
 *     summary: Retorna todas as etapas (steps) de um ticket específico
 *     tags: [Step]
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
 *         description: Lista de steps retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Nenhum step encontrado para o ticket
 */
/**
 * @swagger
 * /step/meta/{id}:
 *   get:
 *     summary: Obtém informações detalhadas de uma etapa pelo seu ID
 *     tags: [Step]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da etapa
 *     responses:
 *       200:
 *         description: Dados encontrados com sucesso
 *       403:
 *         description: Usuário não faz parte da conversa relacionada
 *       404:
 *         description: Etapa ou ticket não encontrado
 */
router.get("/meta/:id", authToken, getStepMetaController);

router.get("/:id", authToken, getAllStepController);

/**
 * @swagger
 * /step/{id}:
 *   put:
 *     tags:
 *       - Step
 *     summary: Atualizar Step
 *     description: Atualiza um Step existente pelo seu ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do Step a ser atualizado
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Novo título do step"
 *               price:
 *                 type: number
 *                 format: double
 *                 example: 150.75
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-10T08:00:00.000Z"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-20T18:00:00.000Z"
 *     responses:
 *       200:
 *         description: Step atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Novo título do step"
 *                 price:
 *                   type: number
 *                   format: double
 *                   example: 150.75
 *                 start_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-10T08:00:00.000Z"
 *                 end_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-20T18:00:00.000Z"
 *                 confirm_freelancer:
 *                   type: boolean
 *                   example: true
 *                 confirm_contractor:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Step não encontrado
 */


router.put("/:id", authToken, checkStepOwnership, updateStepValidator, updateStepController);

/**
 * @swagger
 * /step/{id}:
 *   delete:
 *     tags:
 *       - Step
 *     summary: Deletar Step
 *     description: Remove um Step existente pelo seu ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do Step a ser deletado
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Step deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Step removido com sucesso"
 *       404:
 *         description: Step não encontrado
 */

router.delete("/:id", authToken, checkStepOwnership, deleteStepController);

/**
 * @swagger
 * /step/{id}:
 *   patch:
 *     tags:
 *       - Step
 *     summary: Atualizar status de um Step
 *     description: Atualiza o status de um Step específico pelo seu ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do Step a ser atualizado
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pendente, Concluido, Recusado, Em Andamento]
 *                 example: Concluido
 *     responses:
 *       200:
 *         description: Status do Step atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Step não encontrado
 */

router.patch("/:id", authToken, checkStepOwnership, updateStatusStepController);

/**
 * @swagger
 * /step/signature/{id}:
 *   patch:
 *     tags:
 *       - Step
 *     summary: Atualizar assinatura de um Ticket
 *     description: Atualiza o campo de assinatura (`signature`) de um ticket específico, validando a senha do contratante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do Ticket
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
 *               signature:
 *                 type: boolean
 *                 description: Define se o ticket foi assinado pelo contratante
 *                 example: true
 *               password:
 *                 type: string
 *                 description: Senha do contratante para validar a assinatura
 *                 example: "senha123"
 *             required:
 *               - signature
 *               - password
 *     responses:
 *       200:
 *         description: Assinatura atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Senha incorreta
 *       404:
 *         description: Ticket não encontrado
 */
router.patch(
  "/signature/:id",
  authToken,
  checkStepOwnership,
  updateSignatureStepValidator,
  updateSignatureStepController
);

/**
 * @swagger
 * /step/confirmfreelancer/{id}:
 *   patch:
 *     summary: Confirma ou recusa a participação de um freelancer
 *     description: Apenas o contratante pode confirmar ou recusar a participação de um freelancer em uma demanda.
 *     tags:
 *       - Step
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da demanda/ticket a ser atualizado
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmFreelancer:
 *                 type: boolean
 *                 example: true
 *               password:
 *                 type: string
 *                 example: "senhaDoContratante"
 *     responses:
 *       200:
 *         description: Confirmação do freelancer atualizada com sucesso
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
 *                   example: Confirmação do freelancer atualizada com sucesso.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     confirm_freelancer:
 *                       type: boolean
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-24T20:15:00.000Z"
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       403:
 *         description: Apenas usuários contratantes podem confirmar freelancer
 *       404:
 *         description: Demanda não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch(
  "/confirmfreelancer/:id",
  authToken,
  checkStepOwnership,
  updateConfirmFreelancerValidator,
  updateConfirmFreelancerController
);

module.exports = router;
