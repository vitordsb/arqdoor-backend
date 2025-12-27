const { DataTypes } = require("sequelize");
const sequelize = require("../database/config"); // ajuste o caminho conforme seu projeto
const Provider = require("./ServiceProvider"); // model de usuário

const ServiceFreelancer = sequelize.define(
  "ServiceFreelancer",
  {
    id_serviceFreelancer: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_provider: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Provider,
        key: "provider_id",
      },
      field: "id_provider",
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
  },
  {
    tableName: "ServiceFreelancer",
    timestamps: true, // cria created_at e updated_at
    underscored: true, // usa snake_case
  }
);

// Relacionamento: cada demanda pertence a um usuário
ServiceFreelancer.belongsTo(Provider, {
  foreignKey: "id_provider",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = ServiceFreelancer;
