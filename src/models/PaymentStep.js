const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");

const PaymentStep = sequelize.define(
  "PaymentStep",
  {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Payment", 
        key: "id",
      },
      onDelete: "CASCADE",
    },
    step_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Step",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "payment_steps",
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

module.exports = PaymentStep;
