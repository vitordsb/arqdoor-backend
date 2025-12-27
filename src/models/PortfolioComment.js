const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const Portfolio = require("./Portfolio");
const User = require("./User");

const PortfolioComment = sequelize.define(
  "PortfolioComment",
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
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "portfolioComments",
    updatedAt: false,
  }
);

PortfolioComment.belongsTo(User, { foreignKey: "user_id", as: "User" });
PortfolioComment.belongsTo(Portfolio, { foreignKey: "portfolio_id", as: "Portfolio" });
Portfolio.hasMany(PortfolioComment, { foreignKey: "portfolio_id", as: "Comments" });

module.exports = PortfolioComment;
