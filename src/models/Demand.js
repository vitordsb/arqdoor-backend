const { DataTypes } = require("sequelize");
const sequelize = require("../database/config"); // ajuste o caminho conforme seu projeto
const user = require("./User"); // model de usuário

const Demand = sequelize.define(
  "Demand",
  {
    id_demand: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pendente",
        "em andamento",
        "concluída",
        "cancelada"
      ),
      allowNull: false,
      defaultValue: "pendente",
    },
  },
  {
    tableName: "demand",
    timestamps: true, // cria created_at e updated_at
    underscored: true, // usa snake_case
  }
);

// Relacionamento: cada demanda pertence a um usuário
Demand.belongsTo(user, {
  foreignKey: "id_user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = Demand;
