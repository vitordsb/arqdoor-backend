const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const ServiceProvider = require("./ServiceProvider");
const User = require("./User");

const ProviderRating = sequelize.define(
  "ProviderRating",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ServiceProvider, key: "provider_id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "providerRatings",
  }
);

ProviderRating.belongsTo(ServiceProvider, { foreignKey: "provider_id", as: "Provider" });
ProviderRating.belongsTo(User, { foreignKey: "user_id", as: "User" });

module.exports = ProviderRating;
