const { Router } = require("express");
const ValidatorID = require("../middlewares/validators/validatorID");

// userControllers
const createUserController = require("../controllers/users/createUserController");
const getAllUserController = require("../controllers/users/getAllUserController");
const getOneUserController = require("../controllers/users/getOneUserController");
const deleteUserController = require("../controllers/users/deleteUserController");
// validators
// const createUserValidator = require("../middlewares/validators/users/createUserValidator.js");
const updateUserController = require("../controllers/users/updateUserController");
// const updateUserValidator = require("../middlewares/validators/users/updateUserValidator");
// const createUserValidator = require("../middlewares/validators/users/createUserValidator");
// const updateUserValidator = require("../middlewares/validators/users/updateUserValidator");
// const createUserValidator = require("../middlewares/validators/users/createUserValidator");
// const updateUserValidator = require("../middlewares/validators/users/updateUserValidator");
const createUserValidation = require("../middlewares/validators/users/createUserValidation");
const updateUserValidation = require("../middlewares/validators/users/updateUserValidation");
const getImagesUserController = require("../controllers/users/getImagesUserController");
// const createUserValidator = require("../middlewares/validators/users/createUserValidator");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Endpoints relacionados a usuários
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

router.post("/", createUserValidation, createUserController);

/**
 * @swagger
 * /users/images/{id}:
 *   get:
 *     summary: Retorna todas as imagens associadas a um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de imagens do usuário retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 7
 *                   user_id:
 *                     type: integer
 *                     example: 15
 *                   image_url:
 *                     type: string
 *                     example: https://cdn.exemplo.com/uploads/usuario15_abc123.jpg
 *                   type:
 *                     type: string
 *                     example: perfil
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-07-16T13:30:00Z
 *       404:
 *         description: Usuário não encontrado ou sem imagens
 *       500:
 *         description: Erro interno do servidor
 */

router.get("/images/:id", getImagesUserController);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get("/", getAllUserController);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/:id", ValidatorID, getOneUserController);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza os dados de um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: senhaSegura123
 *               cpf:
 *                 type: string
 *                 example: "12345678900"
 *               cnpj:
 *                 type: string
 *                 example: "12345678000199"
 *               gender:
 *                 type: string
 *                 example: masculino
 *               birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               termos_aceitos:
 *                 type: boolean
 *                 example: true
 *               is_email_verified:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */
router.put("/:id", ValidatorID, updateUserValidation, updateUserController);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete("/:id", ValidatorID, deleteUserController);

module.exports = router;
