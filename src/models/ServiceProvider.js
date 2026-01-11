const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const User = require("./User");

const ServiceProvider = sequelize.define(
  "ServiceProvider",
  {
    provider_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    views_profile: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating_mid: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    payment_preference: {
      type: DataTypes.ENUM("per_step", "at_end", "custom"),
      allowNull: false,
      defaultValue: "at_end",
    },
  },
  {
    tableName: "provider",
    timestamps: true, // ativa created_at e updated_at
    underscored: true, // usa snake_case
  }
);

// Define a associação com a tabela 'usuarios'
ServiceProvider.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = ServiceProvider;
