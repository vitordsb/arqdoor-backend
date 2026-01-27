const sequelize = require('../src/database/config');
const User = require('../src/models/User');

const deleteAllUsers = async () => {
  try {
    console.log('>>> Deletando todos os usuários...');
    
    // Force truncation (ignores foreign key checks temporarily if supported, or cascades)
    // Using simple destroy with truncate: true usually requires CASCADE on FKs in DB.
    // Ideally we disable FK checks, truncate, enable FK checks.
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await User.destroy({ where: {}, truncate: true, force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    
    console.log('>>> Todos os usuários foram removidos com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao deletar usuários:', error);
    process.exit(1);
  }
};

deleteAllUsers();
