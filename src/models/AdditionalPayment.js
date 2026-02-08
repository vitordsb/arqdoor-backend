const { DataTypes } = require("sequelize");
const sequelize = require("../database/config");
const TicketService = require("./TicketService");
const ServiceProvider = require("./ServiceProvider");
const User = require("./User");
const Payment = require("./Payment");

const AdditionalPayment = sequelize.define(
    "AdditionalPayment",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: TicketService,
                key: 'id'
            }
        },
        provider_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ServiceProvider,
                key: 'provider_id'
            }
        },
        contractor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },
        payment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Payment,
                key: 'id'
            },
            comment: "ID do pagamento gerado após aceite"
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "ACCEPTED", "REFUSED", "PAID", "CANCELLED"),
            defaultValue: "PENDING",
        },
        refusal_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "additional_payments",
        timestamps: true,
        underscored: true,
    }
);

module.exports = AdditionalPayment;
