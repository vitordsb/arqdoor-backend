const { Router } = require("express");
const createLocationUserController = require("../controllers/locationUser/createLocationUserController");
const createLocationUserValidator = require("../middlewares/validators/locationUser/createLocationUserValidator");
const getAllLocationUserController = require("../controllers/locationUser/getAllLocationUserController");
const getOneLocationUserController = require("../controllers/locationUser/getOneLocationUserController");
const updateLocationUserController = require("../controllers/locationUser/updateLocationUserController");
const authToken = require("../middlewares/validators/authToken");
const updateLocationUserValidator = require("../middlewares/validators/locationUser/updateLocationUserValidator");
const deleteLocationUserController = require("../controllers/locationUser/deleteLocationUserController");
const router = Router();

/**
 * @swagger
 * /locationuser:
 *   post:
 *     summary: Cria uma nova localização para usuário
 *     tags: [LocationUser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationUser'
 *     responses:
 *       201:
 *         description: Localização criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */

router.post(
  "/",
  authToken,
  createLocationUserValidator,
  createLocationUserController
);

/**
 * @swagger
 * /locationuser:
 *   get:
 *     summary: Buscar todas as localizações de usuários
 *     tags: [LocationUser]
 *     parameters:
 *       - name: user_id
 *         in: query
 *         required: false
 *         description: ID do usuário para filtrar as localizações
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de localizações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LocationUser'
 */

router.get("/", authToken, getAllLocationUserController);

/**
 * @swagger
 * /locationuser/{id}:
 *   get:
 *     summary: Buscar localização do usuário por ID
 *     tags: [LocationUser]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da localização do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da localização do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationUser'
 *       404:
 *         description: Localização do usuário não encontrada
 */

router.get("/:id", authToken, getOneLocationUserController);

/**
 * @swagger
 * /locationuser/{id}:
 *   put:
 *     summary: Atualizar uma localização de usuário
 *     tags: [LocationUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da localização a ser atualizada
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cep:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               neighborhood:
 *                 type: string
 *               street:
 *                 type: string
 *               number:
 *                 type: string
 *               typeLocation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Localização atualizada com sucesso
 *       400:
 *         description: Erro na validação ou dados incorretos
 *       404:
 *         description: Localização não encontrada
 */

router.put(
  "/:id",
  authToken,
  updateLocationUserValidator,
  updateLocationUserController
);

/**
 * @swagger
 * /locationuser/{id}:
 *   delete:
 *     summary: Deletar uma localização de usuário
 *     tags: [LocationUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da localização a ser deletada
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Localização deletada com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Localização não encontrada
 */

router.delete("/:id", authToken, deleteLocationUserController);

module.exports = router;
