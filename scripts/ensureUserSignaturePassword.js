/**
 * Script to ensure User.signature_password_set exists.
 * Execute with: node scripts/ensureUserSignaturePassword.js
 */
const sequelize = require("../src/database/config");

async function ensureColumn() {
  try {
    const [results] = await sequelize.query("DESCRIBE `User`");
    const existing = new Set((results || []).map((r) => r.Field));

    if (!existing.has("signature_password_set")) {
      console.log("Adding column signature_password_set...");
      await sequelize.query(
        "ALTER TABLE `User` ADD COLUMN `signature_password_set` TINYINT(1) NULL DEFAULT NULL;"
      );
      console.log("Column signature_password_set added.");
    } else {
      console.log("Column signature_password_set already exists.");
    }

    console.log("User table checked. Done.");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao alinhar tabela User:", err?.message || err);
    process.exit(1);
  }
}

ensureColumn();
