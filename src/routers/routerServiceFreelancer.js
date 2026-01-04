const { Router } = require("express");
// const CreateServiceFreelancer = require("../controllers/serviceFreelancer/CreateServiceFreelancer");
const authToken = require("../middlewares/validators/authToken");
// const CreateServiceValidator = require("../middlewares/validators/ServiceFreelancerValidators/CreateServiceValidator");
// const GetAllServiceFreelancer = require("../controllers/serviceFreelancer/GetAllServiceFreelancer");
const createServiceValidator = require("../middlewares/validators/servicesFreelancer/createServiceValidator");
const createServiceFreelancerController = require("../controllers/serviceFreelancer/createServiceFreelancerController");
const getAllServiceFreelancerController = require("../controllers/serviceFreelancer/getAllServiceFreelancerController");
const getOneServiceFreelancerController = require("../controllers/serviceFreelancer/getOneServiceFreelancerController");
const validatorID = require("../middlewares/validators/validatorID");
const updateServiceValidator = require("../middlewares/validators/servicesFreelancer/updateServiceValidator");
const updateServiceFreelancerController = require("../controllers/serviceFreelancer/updateServiceFreelancerController");
const deleteServiceFreelancerController = require("../controllers/serviceFreelancer/deleteServiceFreelancerController");
const getAllPublicServiceFreelancerController = require("../controllers/serviceFreelancer/getAllPublicServiceFreelancerController");
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Serviços Freelancer
 *   description: Endpoints para criação e listagem de serviços oferecidos por prestadores
 */

/**
 * @swagger
 * /servicesfreelancer:
 *   post:
 *     summary: Cria um novo serviço como prestador
 *     tags: [Serviços Freelancer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceFreelancerInput'
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceFreelancer'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  "/",
  authToken,
  createServiceValidator,
  createServiceFreelancerController
);

/**
 * @swagger
 * /servicesfreelancer/getall:
 *   get:
 *     summary: Lista todos os serviços freelancer públicos
 *     tags: [Serviços Freelancer]
 *     responses:
 *       200:
 *         description: Lista de serviços freelancer retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceFreelancer'
 *       500:
 *         description: Erro interno do servidor
 */

router.get("/getall", getAllPublicServiceFreelancerController);

/**
 * @swagger
 * /servicesfreelancer:
 *   get:
 *     summary: Lista todos os serviços criados por prestadores
 *     tags: [Serviços Freelancer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviços do freelancer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceFreelancer'
 *       401:
 *         description: Não autorizado
 */
router.get("/", authToken, getAllServiceFreelancerController);

/**
 * @swagger
 * /servicesfreelancer/{id}:
 *   get:
 *     summary: Retorna os dados de um serviço freelancer pelo ID
 *     tags: [Serviços Freelancer]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do serviço freelancer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Serviço encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceFreelancer'
 *       404:
 *         description: Serviço não encontrado
 */

router.get("/:id", validatorID, getOneServiceFreelancerController);

/**
 * @swagger
 * /servicesfreelancer/{id}:
 *   put:
 *     summary: Atualiza os dados de um serviço freelancer
 *     tags: [Serviços Freelancer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do serviço freelancer
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceFreelancerInput'
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceFreelancer'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Serviço não encontrado
 */

router.put(
  "/:id",
  authToken,
  validatorID,
  updateServiceValidator,
  updateServiceFreelancerController
);
/**
 * @swagger
 * /servicesfreelancer/{id}:
 *   delete:
 *     summary: Remove um serviço freelancer pelo ID
 *     tags: [Serviços Freelancer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do serviço freelancer
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Serviço removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Serviço deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Serviço não encontrado
 */

router.delete(
  "/:id",
  authToken,
  validatorID,
  deleteServiceFreelancerController
);
module.exports = router;
