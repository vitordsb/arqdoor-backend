const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const TicketService = require("./TicketService");

const PaymentGroup = sequelize.define(
  "PaymentGroup",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TicketService,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sequence: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "payment_groups",
    timestamps: true,
    underscored: true,
  }
);

PaymentGroup.belongsTo(TicketService, {
  foreignKey: "ticket_id",
  as: "ticket",
});

module.exports = PaymentGroup;