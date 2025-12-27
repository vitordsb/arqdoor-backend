const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const TicketService = require("./TicketService");

const TicketAttchment = sequelize.define(
  "TicketAttchment",
  {
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: TicketService,
        key: "id",
      },
    },
    signature: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    signatureUpdateAt: {
      type: DataTypes.DATE,
    },
    pdf_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "TicketAttchment",
    timestamps: false,
  }
);

TicketAttchment.beforeUpdate((ticket, options) => {
  if (ticket.changed("signature")) {
    // Adiciona a data
    ticket.signatureUpdateAt = new Date();
  }
});

module.exports = TicketAttchment;
