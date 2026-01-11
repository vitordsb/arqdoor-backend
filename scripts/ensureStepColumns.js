/**
 * Script to align Step table with the current model.
 * Execute with: node scripts/ensureStepColumns.js
 */
const sequelize = require("../src/database/config");

const columns = {
  is_financially_cleared: "TINYINT(1) NOT NULL DEFAULT 0",
};

const STATUS_REQUIRED = "Em Andamento";
const STATUS_DEFAULT = "Pendente";

const parseEnumValues = (typeDef = "") => {
  const matches = typeDef.match(/'[^']*'/g) || [];
  return matches.map((value) => value.slice(1, -1));
};

const ensureStatusEnum = async () => {
  const [statusRows] = await sequelize.query(
    "SHOW COLUMNS FROM `Step` LIKE 'status'"
  );
  const statusRow = Array.isArray(statusRows) ? statusRows[0] : null;
  if (!statusRow?.Type) {
    console.log("Status column not found or missing type info. Skipping enum check.");
    return;
  }

  const currentValues = parseEnumValues(statusRow.Type);
  if (currentValues.includes(STATUS_REQUIRED)) {
    return;
  }

  const nextValues = Array.from(
    new Set([...currentValues, STATUS_DEFAULT, STATUS_REQUIRED])
  );
  const enumSql = nextValues
    .map((value) => `'${String(value).replace(/'/g, "''")}'`)
    .join(",");

  console.log("Updating Step.status enum to include 'Em Andamento'...");
  await sequelize.query(
    `ALTER TABLE \`Step\` MODIFY COLUMN \`status\` ENUM(${enumSql}) NOT NULL DEFAULT '${STATUS_DEFAULT}';`
  );
  await sequelize.query(
    "UPDATE `Step` SET `status` = 'Em Andamento' WHERE `status` IN ('Em andamento','em andamento');"
  );
  console.log("Step.status enum updated.");
};

async function ensureColumns() {
  try {
    const [results] = await sequelize.query("DESCRIBE `Step`");
    const existing = new Set((results || []).map((r) => r.Field));

    for (const [name, definition] of Object.entries(columns)) {
      if (existing.has(name)) continue;
      console.log(`Adding column ${name}...`);
      await sequelize.query(
        `ALTER TABLE \`Step\` ADD COLUMN \`${name}\` ${definition};`
      );
      console.log(`Column ${name} added.`);
    }

    await ensureStatusEnum();

    console.log("Step table checked/updated. Done.");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao alinhar tabela Step:", err?.message || err);
    process.exit(1);
  }
}

ensureColumns();
