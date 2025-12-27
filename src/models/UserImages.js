const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const User = require("./User");

const UserImage = sequelize.define(
  "UserImage",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    image_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "userImages",
    timestamps: false,
  }
);

// RELACIONAMENTO
UserImage.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
});

module.exports = UserImage;
