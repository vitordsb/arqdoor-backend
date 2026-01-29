const { Sequelize } = require("sequelize");
// Não chamamos o dotenv.config() aqui, pois o server.js já o faz no topo.

const isTest = process.env.NODE_ENV === 'test';
const dbName = isTest ? 'arqdoor_test' : process.env.DB_NAME;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false, // Desativa os logs de SQL no terminal para ficar mais limpo
    define: {
      timestamps: true,
      underscored: true, // Usa snake_case (created_at) no banco
    }
  }
);

module.exports = sequelize;
