const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const TicketService = require("./TicketService");

const Step = sequelize.define(
  "Step",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        key: "id",
        model: TicketService,
      },
    },
    status: {
      type: DataTypes.ENUM("Pendente", "Concluido", "Recusado", "Em Andamento"),
      // allowNull : true,
      defaultValue: "Pendente",
    },
    signature: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    signatureUpdateAt: {
      type: DataTypes.DATE,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    confirm_freelancer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    confirm_freelancerAt: {
      type: DataTypes.DATE,
    },
    confirm_contractor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rework_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Step",
    timestamps: true, // ativa createdAt e updatedAt
    underscored: true, // usa snake_case: created_at, updated_at
  }
);

Step.beforeUpdate((step, options) => {
  if (step.changed("signature")) {
    // Adiciona a data
    step.signatureUpdateAt = new Date();
    // console.log(step.getDataValue("signature"));
    if (step.getDataValue("signature")) {
      // Confirma a etapa
      step.confirm_contractor = true;
    } else {
      step.confirm_contractor = false;
    }
  }

  if (step.changed("confirm_freelancer")) {
    // Adiciona a data
    step.confirm_freelancerAt = new Date();
  }
});

module.exports = Step;
