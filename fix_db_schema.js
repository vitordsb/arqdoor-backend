const { GhostInvite } = require('./src/models/associations');
const sequelize = require('./src/config/sequelize');

async function fixSchema() {
  try {
    console.log('Syncing GhostInvite schema...');
    await GhostInvite.sync({ alter: true });
    console.log('GhostInvite synced successfully.');
    await sequelize.close();
  } catch (error) {
    console.error('Error syncing schema:', error);
    process.exit(1);
  }
}

fixSchema();
