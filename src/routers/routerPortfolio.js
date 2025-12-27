const { Router } = require("express");
const createPostPortfolioController = require("../controllers/portfolio/createPostPortfolioController");
const updatePostPortfolioController = require("../controllers/portfolio/updatePostPortfolioController");
const deletePostPortfolioController = require("../controllers/portfolio/deletePostPortfolioController");
const authToken = require("../middlewares/validators/authToken");
const createPostPortfolioValidator = require("../middlewares/validators/portfolio/createPostPortfolioValidator");
const updatePostPortfolioValidator = require("../middlewares/validators/portfolio/updatePostPortfolioValidator");
const getAllPostPortfolioController = require("../controllers/portfolio/getAllPostPortfolioController");
const togglePortfolioLikeController = require("../controllers/portfolio/togglePortfolioLikeController");
const createPortfolioCommentController = require("../controllers/portfolio/createPortfolioCommentController");
const getPortfolioEngagementController = require("../controllers/portfolio/getPortfolioEngagementController");
const router = Router();

/**
 * @swagger
 * /portfolio:
 *   post:
 *     summary: Cria um novo item no portfólio do usuário autenticado
 *     tags: [Portfólio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortfolioItemInput'
 *     responses:
 *       201:
 *         description: Item do portfólio criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PortfolioItem'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */

router.post(
  "/",
  authToken,
  createPostPortfolioValidator,
  createPostPortfolioController
);

router.put(
  "/:id",
  authToken,
  updatePostPortfolioValidator,
  updatePostPortfolioController
);

router.delete("/:id", authToken, deletePostPortfolioController);
/**
 * @swagger
 * /portfolio:
 *   get:
 *     summary: Retorna todos os itens do portfólio, opcionalmente filtrados por usuário
 *     tags: [Portfólio]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: integer
 *         description: ID do usuário para filtrar os itens do portfólio
 *         example: 123
 *     responses:
 *       200:
 *         description: Lista de itens do portfólio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PortfolioItem'
 *       401:
 *         description: Não autorizado
 */


router.get("/", getAllPostPortfolioController);

// Likes
router.post("/:id/like", authToken, togglePortfolioLikeController);
router.delete("/:id/like", authToken, togglePortfolioLikeController);

// Comentários
router.post("/:id/comments", authToken, createPortfolioCommentController);

// Engajamento (likes + comentários)
router.get("/:id/engagement", authToken, getPortfolioEngagementController);

module.exports = router;
