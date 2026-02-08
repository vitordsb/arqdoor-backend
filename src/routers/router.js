const { Router } = require("express");
const router = Router();
const routerUser = require("./routerUser");
const routerAuth = require("./routerAuth");
const routerProvider = require("./routerProvider");
const routerDemand = require("./routerDemand");
const routerServiceFreelancer = require("./routerServiceFreelancer");
const routerUpload = require("./routerUpload");
const routerPortfolio = require("./routerPortfolio");
const routerConversation = require("./routerConversations");
const routerMessage = require("./routerMessage");
const routerLocationUser = require("./routerLocationUser");
const routerTicket = require("./routerTicket");
const routerStep = require("./routerStep");
const routerAttchment = require("./routerAttchment");
const routerStepFeedback = require("./routerStepFeedback");
const routerPayment = require("./routerPayment");
const routerAdmin = require("./routerAdmin");
const ticketRoutes = require("./routerTicket");
const routerInvites = require("./routerInvites");
const routerPaymentGroup = require("./routerPaymentGroup");
const routerAdditionalPayment = require("./routerAdditionalPayment"); // [NEW]
const authToken = require("../middlewares/validators/authToken");
const stepIdParamValidator = require("../middlewares/validators/payment/stepIdParamValidator");
const confirmStepPaymentController = require("../controllers/step/confirmStepPaymentController");

router.use("/users", routerUser);
router.use("/auth", routerAuth);
router.use("/providers", routerProvider);
router.use("/demands", routerDemand);
router.use("/servicesfreelancer", routerServiceFreelancer);
router.use("/upload", routerUpload);
router.use("/portfolio", routerPortfolio);
router.use("/conversation", routerConversation);
router.use("/message", routerMessage);
router.use("/locationuser", routerLocationUser);
router.use("/ticket", routerTicket);
router.use("/step", routerStep);
router.use("/attchment", routerAttchment);
router.use("/stepfeedback", routerStepFeedback);
router.use("/payments", routerPayment);
router.use("/admin", routerAdmin);
router.use("/invites", routerInvites);
router.use("/tickets", ticketRoutes);
router.use("/payment-groups", routerPaymentGroup);
router.use("/additional-payments", routerAdditionalPayment); // [NEW]

router.post(
  "/steps/:stepId/confirm-payment",
  authToken,
  stepIdParamValidator,
  confirmStepPaymentController
);

module.exports = router;
