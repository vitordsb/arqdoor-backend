const db = require("../database/config");
const { DataTypes } = require("sequelize");
const Conversation = require("./Conversation");
const User = require("./User");

const Message = db.define("Message", {
  message_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conversation,
      key: "conversation_id",
    },
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
    type: DataTypes.TEXT,
    allowNull: false,
  },
  read: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
},
});

module.exports = Message;
