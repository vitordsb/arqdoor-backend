const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const User = require("./User");
const ServiceProvider = require("./ServiceProvider");
const Conversation = require("./Conversation");
const TicketService = require("./TicketService");

const GhostInvite = sequelize.define(
  "GhostInvite",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
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
      allowNull: false,
      references: {
        model: ServiceProvider,
        key: "provider_id",
      },
      onDelete: "CASCADE",
    },
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Conversation,
        key: "conversation_id",
      },
      onDelete: "SET NULL",
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TicketService,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    token: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contract_pdf_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    steps: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    payment_preference: {
      type: DataTypes.ENUM("per_step", "at_end", "custom"),
      allowNull: false,
      defaultValue: "at_end",
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "accepted", "cancelled"),
      allowNull: false,
      defaultValue: "draft",
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "GhostInvite",
    timestamps: true,
    underscored: true,
  }
);

module.exports = GhostInvite;
