const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const Step = require("./Step");
const TicketService = require("./TicketService");
const User = require("./User");
const ServiceProvider = require("./ServiceProvider");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    step_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Step,
        key: "id",
      },
      onDelete: "CASCADE",
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
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ServiceProvider,
        key: "provider_id",
      },
      onDelete: "SET NULL",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "BRL",
    },
    method: {
      // usava ENUM; trocamos para STRING para evitar truncamento quando surgirem novos meios
      type: DataTypes.STRING(20),
      defaultValue: "PIX",
    },
    status: {
      type: DataTypes.STRING(60),
      defaultValue: "PENDING",
    },
    asaas_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    asaas_invoice_url: {
      type: DataTypes.TEXT,
    },
    pix_payload: {
      type: DataTypes.TEXT("long"),
    },
    pix_image: {
      type: DataTypes.TEXT("long"),
    },
    pix_expires_at: {
      type: DataTypes.DATE,
    },
    due_date: {
      type: DataTypes.DATE,
    },
    paid_at: {
      type: DataTypes.DATE,
    },
    last_event: {
      type: DataTypes.STRING(120),
    },
    attempt: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    description: {
      type: DataTypes.TEXT,
    },
    boleto_url: {
      type: DataTypes.TEXT,
    },
    boleto_barcode: {
      type: DataTypes.STRING(140),
    },
    checkout_url: {
      type: DataTypes.TEXT,
    },
    raw_response: {
      type: DataTypes.TEXT("long"),
    },
    webhook_payload: {
      type: DataTypes.TEXT("long"),
    },
  },
  {
    tableName: "Payment",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Payment;
