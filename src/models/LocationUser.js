const { DataTypes } = require("sequelize");
const sequelize = require("../database/config"); // ajuste o caminho conforme sua estrutura
const User = require("./User");

const LocationUser = sequelize.define(
  "LocationUser",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    cep: {
      type: DataTypes.STRING(8),
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [8, 8],
      },
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    neighborhood: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    typeLocation: {
      type: DataTypes.ENUM("Residencial", "Comercial"),
      defaultValue: "Residencial",
    },
  },
  {
    tableName: "LocationUser",
    underscored: true,
  }
);

module.exports = LocationUser;
