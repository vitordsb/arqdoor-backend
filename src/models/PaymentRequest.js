/**
 * Modelo PaymentRequest
 * Armazena requisições de pagamento para garantir idempotência
 * Previne criação de pagamentos duplicados
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");

const PaymentRequest = sequelize.define(
  "PaymentRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idempotency_key: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      comment: 'Chave única para garantir idempotência de requisições'
    },
    step_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da etapa (para pagamentos individuais)'
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do ticket (para depósitos)'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que fez a requisição'
    },
    status: {
      type: DataTypes.ENUM('processing', 'completed', 'failed'),
      defaultValue: 'processing',
      allowNull: false,
      comment: 'Status do processamento da requisição'
    },
    response: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Resposta da requisição (JSON stringificado)'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Mensagem de erro se status = failed'
    }
  },
  {
    tableName: "payment_requests",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['idempotency_key']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  }
);

module.exports = PaymentRequest;
