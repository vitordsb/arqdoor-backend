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
        "pendente", // ainda não foi aceito ou cancelado, pode ser deletado
        "em andamento", // já foi aceito e esta em andamento, não pode ser deletado
        "concluída", // concluido, já é possivel criar outro ticket, pode ser deletado ?
        "cancelada" // pode deletar
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
      type: DataTypes.ENUM("per_step", "at_end"),
      allowNull: true,
      defaultValue: null,
    },
    payment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "TicketService",
    timestamps: true, // ativa createdAt e updatedAt
    underscored: true, // usa snake_case: created_at, updated_at
  }
);

module.exports = TicketService;
