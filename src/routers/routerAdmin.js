const { Router } = require("express");
const adminAuth = require("../middlewares/adminAuth");
const dashboardController = require("../controllers/admin/dashboardController");
const sendMessageController = require("../controllers/admin/sendMessageController");
const adminConversationController = require("../controllers/admin/adminConversationController");
const adminAttachmentsController = require("../controllers/admin/adminAttachmentsController");
const adminDeleteTicketController = require("../controllers/admin/adminDeleteTicketController");

const router = Router();

router.get("/dashboard", adminAuth, dashboardController);
router.post("/message", adminAuth, sendMessageController);
router.get("/messages/:userId", adminAuth, adminConversationController);
router.get("/contracts/:ticketId/attachments", adminAuth, adminAttachmentsController);
router.delete("/contracts/:ticketId", adminAuth, adminDeleteTicketController);

module.exports = router;
