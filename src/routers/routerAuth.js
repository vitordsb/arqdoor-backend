const { Router } = require("express");

// const LoginUserValidator = require("../middlewares/validators/AuthValidators/LoginUserValidator");
const createUserValidation = require("../middlewares/validators/users/createUserValidation");
const loginUserController = require("../controllers/auth/loginUserController");
const registerUserController = require("../controllers/auth/registerUserController");
const loginUserValidator = require("../middlewares/validators/auth/loginUserValidator");
// const loginUserValidator = require("../middlewares/validators/auth/LoginUserValidator");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints de login e registro
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos ou usuário já existe
 */

router.post("/register", createUserValidation, registerUserController);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Credenciais inválidas
 */

router.post("/login", loginUserValidator, loginUserController);

module.exports = router;
