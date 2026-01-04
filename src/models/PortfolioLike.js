const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const Portfolio = require("./Portfolio");
const User = require("./User");

const PortfolioLike = sequelize.define(
  "PortfolioLike",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    portfolio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Portfolio, key: "id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "portfolioLikes",
    updatedAt: false,
  }
);

PortfolioLike.belongsTo(User, { foreignKey: "user_id", as: "User" });
PortfolioLike.belongsTo(Portfolio, { foreignKey: "portfolio_id", as: "Portfolio" });
Portfolio.hasMany(PortfolioLike, { foreignKey: "portfolio_id", as: "Likes" });

module.exports = PortfolioLike;
