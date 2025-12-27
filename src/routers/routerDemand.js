const { Router } = require("express");
const authToken = require("../middlewares/validators/authToken");
// const DemandValidator = require("../middlewares/validators/DemandValidators/DemandCreateValidator");

const createDemandController = require("../controllers/demand/createDemandController");
const getAllDemandController = require("../controllers/demand/getAllDemandController");
const getOneDemandController = require("../controllers/demand/getOneDemandController");
const createDemandValidator = require("../middlewares/validators/demands/demandCreateValidator");
const updateDemandController = require("../controllers/demand/updateDemandController");
const validatorID = require("../middlewares/validators/validatorID");
const updateDemandValidator = require("../middlewares/validators/demands/updateDemandValidator");
const deleteDemandController = require("../controllers/demand/deleteDemandController");
const updateStatusDemandController = require("../controllers/demand/updateStatusDemandController");
const getAllPublicDemandController = require("../controllers/demand/getAllPublicDemandController");
// const createDemandValidator = require("../middlewares/validators/demands/demandCreateValidator");
const router = Router();
/**
 * @swagger
 * tags:
 *   name: Demandas
 *   description: Endpoints para gerenciamento de demandas criadas por contratantes
 */

/**
 * @swagger
 * /demands:
 *   post:
 *     summary: Cria uma nova demanda
 *     tags: [Demandas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DemandInput'
 *     responses:
 *       201:
 *         description: Demanda criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Demand'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */

router.post("/", authToken, createDemandValidator, createDemandController);

/**
 * @swagger
 * /demands/getall:
 *   get:
 *     summary: Lista todas as demandas públicas (visíveis sem autenticação)
 *     tags: [Demandas]
 *     responses:
 *       200:
 *         description: Lista de demandas públicas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Demand'
 *       500:
 *         description: Erro interno do servidor
 */

router.get("/getall", getAllPublicDemandController);

/**
 * @swagger
 * /demands:
 *   get:
 *     summary: Lista todas as demandas
 *     tags: [Demandas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de demandas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Demand'
 *       401:
 *         description: Não autorizado
 */
router.get("/", authToken, getAllDemandController);

/**
 * @swagger
 * /demands/{id}:
 *   get:
 *     summary: Retorna uma demanda pelo ID
 *     tags: [Demandas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da demanda
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da demanda
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Demand'
 *       404:
 *         description: Demanda não encontrada
 *       401:
 *         description: Não autorizado
 */
router.get("/:id", authToken, getOneDemandController);

/**
 * @swagger
 * /demands/{id}:
 *   put:
 *     summary: Atualiza uma demanda existente
 *     tags: [Demandas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da demanda
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DemandInput'
 *     responses:
 *       200:
 *         description: Demanda atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Demand'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Demanda não encontrada
 */

router.put(
  "/:id",
  authToken,
  validatorID,
  updateDemandValidator,
  updateDemandController
);

/**
 * @swagger
 * /demands/{id}:
 *   delete:
 *     summary: Remove uma demanda pelo ID
 *     tags: [Demandas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da demanda
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Demanda removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Demanda removida com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Demanda não encontrada
 */

router.delete("/:id", authToken, validatorID, deleteDemandController);

/**
 * @swagger
 * /demands/status/{id}:
 *   patch:
 *     summary: Atualiza apenas o status de uma demanda
 *     tags: [Demandas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da demanda
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, em andamento, concluída, cancelada]
 *                 example: concluída
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Demand'
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Demanda não encontrada
 */

router.patch(
  "/status/:id",
  authToken,
  validatorID,
  updateStatusDemandController
);

module.exports = router;
