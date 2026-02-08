const ensureAdditionalPaymentSchema = async () => {
    try {
        const sequelize = require("../src/database/config");
        const AdditionalPayment = require("../src/models/AdditionalPayment");
        const Payment = require("../src/models/Payment");

        console.log("Sincronizando modelos...");

        // 1. Ensure Payment has the new column if we were to add it (though we linked via ID in AdditionalPayment)
        // Actually, the plan said "Adicionar additional_payment_id na tabela Payment".
        // Let's verify if we need it both ways or just one.
        // Usually Payment -> Source (Step/Ticket).
        // If we want Payment to know about AdditionalPayment, we should add `additional_payment_id` to Payment.

        // Check if column exists in Payment
        const [results] = await sequelize.query("SHOW COLUMNS FROM payments LIKE 'additional_payment_id'");
        if (results.length === 0) {
            console.log("Adicionando coluna additional_payment_id na tabela payments...");
            await sequelize.query("ALTER TABLE payments ADD COLUMN additional_payment_id INTEGER NULL");
        }

        // 2. Sync AdditionalPayment table
        await AdditionalPayment.sync({ alter: true });

        console.log("Schema sincronizado com sucesso!");
        process.exit(0);
    } catch (error) {
        console.error("Erro ao sincronizar schema:", error);
        process.exit(1);
    }
};

ensureAdditionalPaymentSchema();
