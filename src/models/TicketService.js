const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const Conversation = require("./Conversation");
const ServiceProvider = require("./ServiceProvider");

const TicketService = sequelize.define(
  "TicketService",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Conversation,
        key: "conversation_id",
      },
      onDelete: "CASCADE",
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: ServiceProvider,
        key: "provider_id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pendente", 
        "em andamento", 
        "concluída", 
        "cancelada" 
      ),
      defaultValue: "pendente",
    },
    total_price: {
      type: DataTypes.DOUBLE,
      defaultValue: 0.0,
    },
    total_date: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    payment_preference: {
      type: DataTypes.ENUM("per_step", "at_end", "custom"),
      allowNull: true,
      defaultValue: "at_end",
    },
    payment_status: {
      type: DataTypes.ENUM(
        "awaiting_deposit",
        "deposit_pending",
        "deposit_paid",
        "awaiting_steps",
        "partial_steps",
        "steps_paid"
      ),
      allowNull: true,
      defaultValue: "awaiting_deposit",
    },
    payment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    allow_grouped_payment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    // Timestamp de quando o trabalho efetivamente começou (após pagamento do depósito)
    work_started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "TicketService",
    timestamps: true, 
    underscored: true,  
  }
);

module.exports = TicketService;
