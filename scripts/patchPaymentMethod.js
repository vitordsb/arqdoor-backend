/**
 * Ajusta a coluna Payment.method para aceitar todos os meios (PIX/BOLETO/CREDIT_CARD/DEBIT_CARD).
 * Executar: node scripts/patchPaymentMethod.js
 */
const sequelize = require("../src/database/config");

async function main() {
  try {
    await sequelize.query(
      "ALTER TABLE `Payment` MODIFY COLUMN `method` VARCHAR(20) NOT NULL DEFAULT 'PIX';"
    );
    console.log("Coluna Payment.method ajustada para VARCHAR(20).");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao ajustar Payment.method:", err?.message || err);
    process.exit(1);
  }
}

main();
