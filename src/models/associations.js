/**
 * Arquivo central para definir todas as associações entre models
 * Isso evita problemas de dependência circular
 */

const User = require('./User');
const Conversation = require('./Conversation');
const TicketService = require('./TicketService');
const Step = require('./Step');
const ServiceProvider = require('./ServiceProvider');
const Payment = require('./Payment');
const PaymentStep = require('./PaymentStep');
const PaymentGroup = require('./PaymentGroup');
const LocationUser = require('./LocationUser');

// User associations
User.hasOne(LocationUser, {
  foreignKey: 'user_id',
  as: 'LocationUser'
});

LocationUser.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Conversation associations
Conversation.hasMany(TicketService, {
  foreignKey: 'conversation_id',
  as: 'tickets'
});

// TicketService associations
TicketService.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

TicketService.belongsTo(ServiceProvider, {
  foreignKey: 'provider_id',
  as: 'provider'
});

// Step associations
Step.belongsTo(TicketService, {
  foreignKey: 'ticket_id',
  as: 'TicketService'
});

Step.belongsToMany(Payment, {
  through: PaymentStep,
  foreignKey: 'step_id',
  otherKey: 'payment_id'
});

Step.belongsTo(PaymentGroup, {
  foreignKey: 'group_id',
  as: 'paymentGroup'
});

// Payment associations
Payment.belongsToMany(Step, {
  through: PaymentStep,
  foreignKey: 'payment_id',
  otherKey: 'step_id'
});

module.exports = {
  User,
  Conversation,
  TicketService,
  Step,
  ServiceProvider,
  Payment,
  PaymentStep,
  PaymentStep,
  PaymentGroup,
  LocationUser
};
