/**
 * Script to align TicketService table with the current model.
 * Execute with: node scripts/ensureTicketServiceColumns.js
 */
const sequelize = require("../src/database/config");

const paymentPreferenceDefinition =
  "ENUM('per_step','at_end','custom') NULL DEFAULT 'at_end'";

const columns = {
  payment_preference: paymentPreferenceDefinition,
  payment_status:
    "ENUM('awaiting_deposit','deposit_pending','deposit_paid','awaiting_steps','partial_steps','steps_paid') NULL DEFAULT 'awaiting_deposit'",
  allow_grouped_payment: "TINYINT(1) NOT NULL DEFAULT 0",
};

async function ensureColumns() {
  try {
    const [results] = await sequelize.query("DESCRIBE `TicketService`");
    const columnMap = new Map((results || []).map((r) => [r.Field, r]));
    const existing = new Set((results || []).map((r) => r.Field));

    const paymentPrefColumn = columnMap.get("payment_preference");
    if (paymentPrefColumn && !paymentPrefColumn.Type.includes("'custom'")) {
      console.log("Updating enum payment_preference...");
      await sequelize.query(
        `ALTER TABLE \`TicketService\` MODIFY COLUMN \`payment_preference\` ${paymentPreferenceDefinition};`
      );
      console.log("Enum payment_preference updated.");
    }

    for (const [name, definition] of Object.entries(columns)) {
      if (existing.has(name)) continue;
      console.log(`Adding column ${name}...`);
      await sequelize.query(
        `ALTER TABLE \`TicketService\` ADD COLUMN \`${name}\` ${definition};`
      );
      console.log(`Column ${name} added.`);
    }

    await sequelize.query(
      "UPDATE `TicketService` SET `payment_status` = CASE WHEN `payment_preference` = 'at_end' OR `payment_preference` IS NULL THEN 'awaiting_deposit' ELSE 'awaiting_steps' END WHERE `payment_status` IS NULL;"
    );

    console.log("TicketService table checked/updated. Done.");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao alinhar tabela TicketService:", err?.message || err);
    process.exit(1);
  }
}

ensureColumns();
