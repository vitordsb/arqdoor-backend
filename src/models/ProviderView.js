const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const ServiceProvider = require("./ServiceProvider");
const User = require("./User");

const ProviderView = sequelize.define(
  "ProviderView",
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
    viewer_user_id: {
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
    tableName: "providerViews",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["provider_id", "viewer_user_id"],
      },
    ],
  }
);

ProviderView.belongsTo(ServiceProvider, { foreignKey: "provider_id", as: "Provider" });
ProviderView.belongsTo(User, { foreignKey: "viewer_user_id", as: "Viewer" });

module.exports = ProviderView;
