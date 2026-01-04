const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const Step = require("./Step");

const StepFeedback = sequelize.define(
  "StepFeedback",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    step_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        key: "id",
        model: Step,
      },
    },
    type: {
      type: DataTypes.ENUM("feedback", "issue"),
      allowNull: false,
      defaultValue: "feedback",
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "StepFeedback",
    timestamps: true, // ativa createdAt e updatedAt
    underscored: true, // usa snake_case: created_at, updated_at
  }
);

module.exports = StepFeedback;
