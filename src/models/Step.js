const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const TicketService = require("./TicketService");
const PaymentGroup = require("./PaymentGroup");
const {
  STEP_MIN_PRICE,
  STEP_TITLE_MIN_LENGTH,
  STEP_TITLE_MAX_LENGTH
} = require("../constants/validation");

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

// Hook de validação ANTES de salvar no banco
Step.beforeValidate((step, options) => {
  // Validar preço mínimo (exceto para etapa de assinatura que tem preço 0)
  const isSignatureStep = step.title && step.title.toLowerCase().includes('assinatura');

  if (!isSignatureStep && step.price !== null && step.price !== undefined) {
    if (step.price < STEP_MIN_PRICE) {
      throw new Error(`Preço mínimo é R$ ${STEP_MIN_PRICE.toFixed(2)}`);
    }
  }

  // Validar título
  if (step.title) {
    const trimmedTitle = step.title.trim();

    if (trimmedTitle.length < STEP_TITLE_MIN_LENGTH) {
      throw new Error(
        `Título deve ter no mínimo ${STEP_TITLE_MIN_LENGTH} caracteres`
      );
    }

    if (trimmedTitle.length > STEP_TITLE_MAX_LENGTH) {
      throw new Error(
        `Título deve ter no máximo ${STEP_TITLE_MAX_LENGTH} caracteres`
      );
    }
  }
});

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
