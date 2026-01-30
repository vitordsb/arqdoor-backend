const { Router } = require("express");
const multer = require("multer");
const authToken = require("../middlewares/validators/authToken");
const configMulterPdf = require("../config/configMulterPdf");
const createInviteValidator = require("../middlewares/validators/invites/createInviteValidator");
const updateInviteValidator = require("../middlewares/validators/invites/updateInviteValidator");
const createInviteController = require("../controllers/invites/createInviteController");
const getAllInvitesController = require("../controllers/invites/getAllInvitesController");
const getInviteByIdController = require("../controllers/invites/getInviteByIdController");
const updateInviteController = require("../controllers/invites/updateInviteController");
const deleteInviteController = require("../controllers/invites/deleteInviteController");
const uploadInvitePdfController = require("../controllers/invites/uploadInvitePdfController");
const getInvitePublicController = require("../controllers/invites/getInvitePublicController");
const acceptInviteController = require("../controllers/invites/acceptInviteController");
const noCache = require("../middlewares/noCache");

const router = Router();
const uploadPdf = multer({
  storage: configMulterPdf.storage,
  fileFilter: configMulterPdf.fileFilter,
});

router.use(noCache); // Aplica no-cache para todas as rotas de convite

router.get("/public/:token", getInvitePublicController);
router.post("/public/:token/accept", authToken, acceptInviteController);

router.post("/", authToken, createInviteValidator, createInviteController);
router.get("/", authToken, getAllInvitesController);
router.get("/:id", authToken, getInviteByIdController);
router.put("/:id", authToken, updateInviteValidator, updateInviteController);
router.delete("/:id", authToken, deleteInviteController);
router.post(
  "/:id/pdf",
  authToken,
  uploadPdf.single("file"),
  uploadInvitePdfController
);

module.exports = router;
