const createAdditionalPaymentService = require("../../services/payment/createAdditionalPaymentService");

const createAdditionalPaymentController = async (req, res) => {
    try {
        const { ticket_id, title, description, amount } = req.body;
        const user = req.user;

        const result = await createAdditionalPaymentService(
            { ticket_id, title, description, amount },
            user
        );

        return res.status(result.code).json(result);
    } catch (error) {
        console.error("Erro no createAdditionalPaymentController:", error);
        return res.status(500).json({
            code: 500,
            message: "Erro interno no servidor",
            success: false,
        });
    }
};

module.exports = createAdditionalPaymentController;
