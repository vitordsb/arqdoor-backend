const { Router } = require("express");
const createProviderController = require("../controllers/provider/createProviderController");
const getAllProviderController = require("../controllers/provider/getAllProviderController");
const getOneProviderController = require("../controllers/provider/getOneProviderController");
// const createProviderValidator = require("../middlewares/validators/ProviderValidators/createProviderValidator");
const deleteProviderController = require("../controllers/provider/deleteProviderController");
const createProviderValidator = require("../middlewares/validators/providers/createProviderValidator");
const authToken = require("../middlewares/validators/authToken");
const updateProviderValidator = require("../middlewares/validators/providers/updateProviderValidator");
const validatorID = require("../middlewares/validators/validatorID");
const updateProviderController = require("../controllers/provider/updateProviderController");
const addViewProviderController = require("../controllers/provider/addViewProviderController");
const getProviderByUserController = require("../controllers/provider/getProviderByUserController");
const getProviderRatingsController = require("../controllers/provider/getProviderRatingsController");
const upsertProviderRatingController = require("../controllers/provider/upsertProviderRatingController");
const deleteProviderRatingController = require("../controllers/provider/deleteProviderRatingController");
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Prestadores
 *   description: Endpoints para gerenciar prestadores de serviço
 */

/**
 * @swagger
 * /providers:
 *   post:
 *     summary: Cria um novo prestador de serviço, não necessariamente e necessario criar o prestador manualmente, ele e criado automaticamente quando se cria um usuario do tipo 'prestador'
 *     tags: [Prestadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceProviderInput'
 *     responses:
 *       201:
 *         description: Prestador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProvider'
 *       400:
 *         description: Dados inválidos
 */
router.post("/", createProviderValidator, createProviderController);

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Retorna todos os prestadores de serviço
 *     tags: [Prestadores]
 *     responses:
 *       200:
 *         description: Lista de prestadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceProvider'
 */
router.get("/", getAllProviderController);

/**
 * @swagger
 * /providers/user/{user_id}:
 *   get:
 *     summary: Retorna o prestador vinculado a um usuário específico
 *     tags: [Prestadores]
 *     parameters:
 *       - name: user_id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prestador encontrado
 *       404:
 *         description: Prestador não encontrado
 */
router.get("/user/:user_id", getProviderByUserController);

/**
 * @swagger
 * /providers/{id_provider}:
 *   get:
 *     summary: Retorna um prestador pelo ID
 *     tags: [Prestadores]
 *     parameters:
 *       - name: id_provider
 *         in: path
 *         required: true
 *         description: ID do prestador de serviço
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prestador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProvider'
 *       404:
 *         description: Prestador não encontrado
 */
router.get("/:id_provider", getOneProviderController);

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     summary: ROTA EM MANUTENÇÃO
 *     tags: [Prestadores]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do prestador de serviço
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prestador deletado com sucesso
 *       404:
 *         description: Prestador não encontrado
 */
router.delete("/:id", authToken, validatorID, deleteProviderController);

/**
 * @swagger
 * /providers/{id}:
 *   put:
 *     summary: Atualiza os dados de um prestador de serviço
 *     tags: [Prestadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do prestador
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profession:
 *                 type: string
 *                 example: Encanador
 *               about:
 *                 type: string
 *                 example: Tenho 15 anos de experiência em serviços hidráulicos.
 *     responses:
 *       200:
 *         description: Prestador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceProvider'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Prestador não encontrado
 */

router.put(
  "/:id",
  authToken,
  updateProviderValidator,
  validatorID,
  updateProviderController
);

/**
 * @swagger
 * /providers/addview/{id}:
 *   patch:
 *     summary: Adiciona uma visualização ao perfil de um prestador
 *     tags: [Prestadores]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do prestador
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Visualização incrementada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views_profile:
 *                   type: integer
 *                   example: 27
 *       404:
 *         description: Prestador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

router.patch("/addview/:id", authToken, addViewProviderController);

// Avaliações
router.get("/:id/ratings", authToken, getProviderRatingsController);
router.post("/:id/ratings", authToken, upsertProviderRatingController);
router.put("/:id/ratings", authToken, upsertProviderRatingController);
router.delete("/:id/ratings", authToken, deleteProviderRatingController);

module.exports = router;
