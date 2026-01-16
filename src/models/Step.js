const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const TicketService = require("./TicketService");
const PaymentGroup = require("./PaymentGroup");

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
        model: "TicketService",
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
    // campo para desacoplar o pagamento do progresso da etapa
    is_financially_cleared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // campo para agrupar etapas para pagamento agrupado
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PaymentGroup,
        key: "id",
      },
    },
  },
  {
    tableName: "Step",
    timestamps: true,  
    underscored: true, 
  }
);

Step.beforeUpdate((step, options) => {
  if (step.changed("signature")) {
    step.signatureUpdateAt = new Date();
    if (step.getDataValue("signature")) {
      step.confirm_contractor = true;
    } else {
      step.confirm_contractor = false;
    }
  }

  if (step.changed("confirm_freelancer")) {
    step.confirm_freelancerAt = new Date();
  }
});

module.exports = Step;

const Payment = require("./Payment");
const PaymentStep = require("./PaymentStep");

Step.belongsToMany(Payment, {
  through: PaymentStep,
  foreignKey: "step_id",
  otherKey: "payment_id",
});

Step.belongsTo(PaymentGroup, {
  foreignKey: "group_id",
  as: "paymentGroup",
});
