/**
 * Pequeno script para alinhar a tabela Payment com o model atual.
 * Execute com: node scripts/ensurePaymentColumns.js
 */
const sequelize = require("../src/database/config");

const columns = {
  boleto_url: "TEXT NULL",
  boleto_barcode: "VARCHAR(140) NULL",
  checkout_url: "TEXT NULL",
  webhook_payload: "LONGTEXT NULL",
};

async function ensureColumns() {
  try {
    const [results] = await sequelize.query("DESCRIBE `Payment`");
    const existing = new Set((results || []).map((r) => r.Field));

    for (const [name, definition] of Object.entries(columns)) {
      if (existing.has(name)) continue;
      console.log(`Adding column ${name}...`);
      await sequelize.query(`ALTER TABLE \`Payment\` ADD COLUMN \`${name}\` ${definition};`);
      console.log(`Column ${name} added.`);
    }

    console.log("Payment table checked/updated. Done.");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao alinhar tabela Payment:", err?.message || err);
    process.exit(1);
  }
}

ensureColumns();
