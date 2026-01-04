const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

const DBAuthenticate = async () => {
  try {
    await sequelize.authenticate().then(async () => {
      console.log("==========================================================");
      console.log(`Banco de dados conectado com sucesso`);
      console.log("==========================================================");
      const enableSync = process.env.ENABLE_DB_SYNC === "true";
      if (enableSync) {
        try {
          await sequelize.sync({ alter: false });
          console.log("Sincronização de modelos habilitada (ENABLE_DB_SYNC=true)");
        } catch (syncErr) {
          console.warn(
            "Sincronização falhou e foi ignorada (defina ENABLE_DB_SYNC=false para evitar novas tentativas).",
            syncErr?.message || syncErr
          );
        }
      } else {
        console.log("Sincronização de modelos desabilitada (defina ENABLE_DB_SYNC=true se precisar rodar sync).");
      }
    });
  } catch (error) {
    console.log("==========================================================");
    console.log(`Erro ao conectar no banco de dados ${error}`);
    console.log("==========================================================");
  }
};

DBAuthenticate();

module.exports = sequelize;
