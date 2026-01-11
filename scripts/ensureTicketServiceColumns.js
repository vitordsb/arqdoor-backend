/**
 * Script to align TicketService table with the current model.
 * Execute with: node scripts/ensureTicketServiceColumns.js
 */
const sequelize = require("../src/database/config");

const columns = {
  payment_preference: "ENUM('per_step','at_end') NULL DEFAULT 'at_end'",
  allow_grouped_payment: "TINYINT(1) NOT NULL DEFAULT 0",
};

async function ensureColumns() {
  try {
    const [results] = await sequelize.query("DESCRIBE `TicketService`");
    const existing = new Set((results || []).map((r) => r.Field));

    for (const [name, definition] of Object.entries(columns)) {
      if (existing.has(name)) continue;
      console.log(`Adding column ${name}...`);
      await sequelize.query(
        `ALTER TABLE \`TicketService\` ADD COLUMN \`${name}\` ${definition};`
      );
      console.log(`Column ${name} added.`);
    }

    console.log("TicketService table checked/updated. Done.");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao alinhar tabela TicketService:", err?.message || err);
    process.exit(1);
  }
}

ensureColumns();
