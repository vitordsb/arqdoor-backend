const db = require("../database/config");
const { DataTypes } = require("sequelize");
const User = require("./User");

const Conversation = db.define("Conversation", {
  conversation_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
    references: {
      model: User,
      key: "id",
    },
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    onDelete: "CASCADE",
    references: {
      model: User,
      key: "id",
    },
  },
  is_negotiation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

const TicketService = require("./TicketService");

Conversation.hasMany(TicketService, {
  foreignKey: "conversation_id",
});

module.exports = Conversation;
