const { DataTypes } = require("sequelize");
const sequelize = require("../database/config"); // ajuste o caminho conforme sua estrutura
const UserImage = require("./UserImages");
const User = require("./User");

const Portfolio = sequelize.define("Portfolio", {
  image_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserImage,
      key: "id",
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

// RELACIONAMENTO
Portfolio.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
});

Portfolio.belongsTo(UserImage, {
  foreignKey: "image_id",
  as: "UserImage",
});

module.exports = Portfolio;
