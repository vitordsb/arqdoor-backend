const { Router } = require("express");
const router = Router();
const multer = require("multer");

const uploadImageController = require("../controllers/uploads/uploadImageController");
const authToken = require("../middlewares/validators/authToken");
const validatorUploadImage = require("../middlewares/validators/upload/validatorUploadImage");
// const { storage, fileFilter } = require("../config/configMulterImage");
const configMulterImage = require("../config/configMulterImage");
const configMulterPdf = require("../config/configMulterPdf");
// const uploadImageService = require("../services/upload/uploadImageService");
const getAllImagesController = require("../controllers/uploads/getAllImagesController");
const uploadPdfController = require("../controllers/uploads/uploadPdfController");

const uploadImage = multer({
  storage: configMulterImage.storage,
  fileFilter: configMulterImage.fileFilter,
});

const uploadPdf = multer({
  storage: configMulterPdf.storage,
  fileFilter: configMulterPdf.fileFilter,
});

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Faz upload de uma imagem para o usuário autenticado
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 example: perfil
 *     responses:
 *       200:
 *         description: Imagem enviada com sucesso
 */
router.post(
  "/image",
  authToken,
  // validatorUploadImage,
  uploadImage.single("file"),
  uploadImageController
);

/**
 * @swagger
 * /upload/images:
 *   get:
 *     summary: Retorna todas as imagens, com opção de filtrar por ID do usuário
 *     tags: [Imagens]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID do usuário para filtrar as imagens
 *     responses:
 *       200:
 *         description: Lista de imagens retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 5
 *                   image_url:
 *                     type: string
 *                     example: "uploads/1721139884950.jpg"
 *                   type:
 *                     type: string
 *                     example: "portfolio"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Não autorizado
 */
router.get("/images", getAllImagesController);

/**
 * @swagger
 * /upload/pdf/{ticket_id}:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload de PDF
 *     description: Faz upload de um arquivo PDF associado a um ticket.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ticket associado ao PDF
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo PDF a ser enviado
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Upload concluído"
 *                 ticket_id:
 *                   type: integer
 *                   example: 123
 *                 filePath:
 *                   type: string
 *                   example: "uploads/pdfs/proposta123.pdf"
 */
router.post(
  "/pdf/:id",
  authToken,
  uploadPdf.single("file"),
  uploadPdfController
);

module.exports = router;
