require('dotenv').config();
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
  // await sequelize.close(); // Let Jest forceExit handle it to avoid timeouts
});
