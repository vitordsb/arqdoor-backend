const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Ensure test env is loaded before Sequelize is instantiated (database/config reads process.env on import).
const envTestPath = path.resolve(__dirname, "..", "..", ".env.test");
const envExamplePath = path.resolve(__dirname, "..", "..", ".env.test.example");
const envDefaultPath = path.resolve(__dirname, "..", "..", ".env");

const envPath =
  process.env.NODE_ENV === "test"
    ? fs.existsSync(envTestPath)
      ? envTestPath
      : envExamplePath
    : envDefaultPath;

dotenv.config({ path: envPath });
const sequelize = require('../database/config');
const associations = require('../models/associations'); // Ensure models are loaded

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Running tests in non-test environment! NODE_ENV must be "test"');
  }

  try {
    await sequelize.authenticate();
    // Drop and recreate tables
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    // console.log('Test DB synced.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    throw err;
  }
});

afterAll(async () => {
  await sequelize.close();
});
