/**
 * Script to align provider table with the current ServiceProvider model.
 * Execute with: node scripts/ensureProviderColumns.js
 */
const sequelize = require("../src/database/config");

const paymentPreferenceDefinition =
  "ENUM('per_step','at_end','custom') NOT NULL DEFAULT 'at_end'";

async function ensureColumns() {
  try {
    const [results] = await sequelize.query("DESCRIBE `provider`");
    const columnMap = new Map((results || []).map((r) => [r.Field, r]));
    const paymentPrefColumn = columnMap.get("payment_preference");

    if (paymentPrefColumn && !paymentPrefColumn.Type.includes("'custom'")) {
      console.log("Updating enum payment_preference...");
      await sequelize.query(
        `ALTER TABLE \`provider\` MODIFY COLUMN \`payment_preference\` ${paymentPreferenceDefinition};`
      );
      console.log("Enum payment_preference updated.");
    }

    await sequelize.query(
      "UPDATE `provider` SET `payment_preference` = 'at_end' WHERE `payment_preference` IS NULL;"
    );

    console.log("Provider table checked/updated. Done.");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao alinhar tabela provider:", err?.message || err);
    process.exit(1);
  }
}

ensureColumns();
