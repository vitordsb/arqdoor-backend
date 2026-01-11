/*
 * Clear database data by truncating all tables in the configured schema.
 *
 * Usage:
 *   node scripts/clearDatabase.js --force
 *   node scripts/clearDatabase.js --force --drop
 *   node scripts/clearDatabase.js --force --keep=table1,table2
 *
 * Notes:
 * - Default action is TRUNCATE (keeps schema).
 * - Use --drop to drop all tables.
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

process.env.ENABLE_DB_SYNC = "false";

const { QueryTypes } = require("sequelize");
const sequelize = require("../src/database/config");

const args = process.argv.slice(2);
const force = args.includes("--force") || args.includes("--yes");
const drop = args.includes("--drop");

const getArgValue = (prefix) => {
  const match = args.find((arg) => arg.startsWith(`${prefix}=`));
  if (!match) return null;
  return match.slice(prefix.length + 1);
};

const parseList = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const keepArg = getArgValue("--keep");
const keepEnv = process.env.DB_CLEAR_KEEP_TABLES || "";
const keepTables = new Set([...parseList(keepEnv), ...parseList(keepArg)]);

const schema = process.env.DB_NAME;

const printUsage = () => {
  console.log("Missing --force flag.");
  console.log("Usage:");
  console.log("  node scripts/clearDatabase.js --force");
  console.log("  node scripts/clearDatabase.js --force --drop");
  console.log("  node scripts/clearDatabase.js --force --keep=table1,table2");
  console.log("Optional env: DB_CLEAR_KEEP_TABLES=table1,table2");
};

const run = async () => {
  if (!force) {
    printUsage();
    return process.exit(1);
  }

  if (!schema) {
    console.error("DB_NAME is not set. Check your .env.");
    return process.exit(1);
  }

  const tables = await sequelize.query(
    "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = :schema AND table_type = 'BASE TABLE'",
    { replacements: { schema }, type: QueryTypes.SELECT }
  );

  const tableNames = (tables || []).map((row) => row.name);
  const targets = tableNames.filter((name) => !keepTables.has(name));

  if (!targets.length) {
    console.log("No tables to clear.");
    return process.exit(0);
  }

  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
  try {
    for (const table of targets) {
      const sql = drop
        ? `DROP TABLE IF EXISTS \`${table}\`;`
        : `TRUNCATE TABLE \`${table}\`;`;
      await sequelize.query(sql);
      console.log(`${drop ? "Dropped" : "Truncated"} table: ${table}`);
    }
  } finally {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  }

  console.log(drop ? "All tables dropped." : "All tables truncated.");
  return process.exit(0);
};

run()
  .catch((error) => {
    console.error("Failed to clear database:", error?.message || error);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch {
      // ignore
    }
  });
