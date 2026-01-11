const { DataTypes } = require("sequelize");
const db = require("../database/config");
// const Cidade = require("./Cidade");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      // obrigatorio
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      // obrigatorio
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      // obrigatorio
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    birth: {
      // obrigatorio
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      // obrigatorio
      type: DataTypes.ENUM("Masculino", "Feminino", "Prefiro não dizer"),
      allowNull: false,
    },
    cpf: {
      // opcional
      type: DataTypes.CHAR(111),
      // allowNull: false,
      unique: true,
    },
    cnpj: {
      // opcional
      type: DataTypes.CHAR(111),
      // allowNull: false,
      unique: true,
    },

    type: {
      // obrigatorio
      type: DataTypes.ENUM("contratante", "prestador"),
      allowNull: false,
    },

    termos_aceitos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    perfil_completo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    signature_password_set: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "User",
    timestamps: true, // ativa createdAt e updatedAt
    underscored: true, // usa snake_case: created_at, updated_at
  }
);

module.exports = User;
