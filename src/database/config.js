const { Sequelize } = require("sequelize");
// Não chamamos o dotenv.config() aqui, pois o server.js já o faz no topo.

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Desativa os logs de SQL no terminal para ficar mais limpo
    define: {
      timestamps: true,
      underscored: true, // Usa snake_case (created_at) no banco
    }
  }
);

module.exports = sequelize;
