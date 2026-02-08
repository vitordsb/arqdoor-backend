const respondAdditionalPaymentService = require("../../services/payment/respondAdditionalPaymentService");

const respondAdditionalPaymentController = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason, method } = req.body;
        const user = req.user;

        if (!["accept", "refuse"].includes(action)) {
            return res.status(400).json({
                code: 400,
                message: "Ação inválida. Use 'accept' ou 'refuse'.",
                success: false
            });
        }

        const result = await respondAdditionalPaymentService(
            id,
            action,
            { reason, method },
            user
        );

        return res.status(result.code).json(result);
    } catch (error) {
        console.error("Erro no respondAdditionalPaymentController:", error);
        return res.status(500).json({
            code: 500,
            message: "Erro interno no servidor",
            success: false,
        });
    }
};

module.exports = respondAdditionalPaymentController;
