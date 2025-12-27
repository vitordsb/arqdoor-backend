const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const User = require("./User");

const PaymentCustomer = sequelize.define(
  "PaymentCustomer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    asaas_customer_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    document_type: {
      type: DataTypes.ENUM("CPF", "CNPJ"),
      allowNull: true,
    },
    document_value: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    payload: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
  },
  {
    tableName: "PaymentCustomer",
    timestamps: true,
    underscored: true,
  }
);

PaymentCustomer.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

module.exports = PaymentCustomer;
