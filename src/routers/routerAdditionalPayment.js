const { Router } = require("express");
const router = Router();
const createAdditionalPaymentController = require("../controllers/payment/createAdditionalPaymentController");
const respondAdditionalPaymentController = require("../controllers/payment/respondAdditionalPaymentController");
const listAdditionalPaymentsController = require("../controllers/payment/listAdditionalPaymentsController");
const authToken = require("../middlewares/validators/authToken");

// POST /additional-payments
// Cria uma nova cobrança (Prestador)
router.post(
    "/",
    authToken,
    createAdditionalPaymentController
);

// GET /additional-payments/ticket/:ticketId
// Lista cobranças de um ticket (Prestador ou Cliente)
// Note: Changed path to avoid collision or ambiguity. 
// Plan said: /tickets/:ticketId/additional-payments but here we are in /additional-payments prefix likely.
// So /additional-payments/ticket/:ticketId is good.
router.get(
    "/ticket/:ticketId",
    authToken,
    listAdditionalPaymentsController
);

// PATCH /additional-payments/:id/respond
// Responde (Aceita/Recusa) uma cobrança (Cliente)
router.patch(
    "/:id/respond",
    authToken,
    respondAdditionalPaymentController
);

module.exports = router;
