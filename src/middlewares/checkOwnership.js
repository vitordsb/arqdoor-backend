/**
 * Middlewares de verificação de propriedade (ownership)
 * Garantem que usuários só acessem recursos que pertencem a eles
 */

const Step = require('../models/Step');
const TicketService = require('../models/TicketService');
const Conversation = require('../models/Conversation');
const Payment = require('../models/Payment');
const { ForbiddenError, NotFoundError } = require('../utils/AppError');

/**
 * Verifica se o usuário tem permissão para acessar um Step
 * O usuário deve ser participante da conversa relacionada ao ticket do step
 */
const checkStepOwnership = async (req, res, next) => {
  try {
    const { id, stepId } = req.params;
    const targetStepId = id || stepId;

    if (!targetStepId) {
      throw new NotFoundError('ID da etapa não fornecido');
    }

    // Buscar step com ticket e conversation
    const step = await Step.findByPk(targetStepId, {
      include: [{
        model: TicketService,
        as: 'TicketService',
        required: false,
        include: [{
          model: Conversation,
          as: 'conversation',
          required: false
        }]
      }]
    });

    if (!step) {
      throw new NotFoundError('Etapa não encontrada');
    }

    // Buscar ticket se não veio no include
    let ticket = step.TicketService;
    if (!ticket) {
      ticket = await TicketService.findByPk(step.ticket_id, {
        include: [{
          model: Conversation,
          as: 'conversation'
        }]
      });
    }

    if (!ticket) {
      throw new NotFoundError('Ticket não encontrado para esta etapa');
    }

    const conversation = ticket.conversation;
    if (!conversation) {
      throw new NotFoundError('Conversa não encontrada para este ticket');
    }

    // Verificar se o usuário é participante da conversa
    const isParticipant = 
      conversation.user1_id === req.user.id || 
      conversation.user2_id === req.user.id;

    if (!isParticipant) {
      throw new ForbiddenError('Você não tem permissão para acessar esta etapa');
    }

    // Anexar dados no request para uso posterior
    req.step = step;
    req.ticket = ticket;
    req.conversation = conversation;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verifica se o usuário tem permissão para acessar um Ticket
 */
const checkTicketOwnership = async (req, res, next) => {
  try {
    const { id, ticketId } = req.params;
    const targetTicketId = id || ticketId;

    if (!targetTicketId) {
      throw new NotFoundError('ID do ticket não fornecido');
    }

    const ticket = await TicketService.findByPk(targetTicketId, {
      include: [{
        model: Conversation,
        as: 'conversation'
      }]
    });

    if (!ticket) {
      throw new NotFoundError('Ticket não encontrado');
    }

    const conversation = ticket.conversation;
    if (!conversation) {
      throw new NotFoundError('Conversa não encontrada para este ticket');
    }

    const isParticipant = 
      conversation.user1_id === req.user.id || 
      conversation.user2_id === req.user.id;

    if (!isParticipant) {
      throw new ForbiddenError('Você não tem permissão para acessar este ticket');
    }

    req.ticket = ticket;
    req.conversation = conversation;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verifica se o usuário tem permissão para acessar um Payment
 */
const checkPaymentOwnership = async (req, res, next) => {
  try {
    const { id, paymentId } = req.params;
    const targetPaymentId = id || paymentId;

    if (!targetPaymentId) {
      throw new NotFoundError('ID do pagamento não fornecido');
    }

    const payment = await Payment.findByPk(targetPaymentId, {
      include: [{
        model: TicketService,
        as: 'ticket',
        include: [{
          model: Conversation,
          as: 'conversation'
        }]
      }]
    });

    if (!payment) {
      throw new NotFoundError('Pagamento não encontrado');
    }

    const ticket = payment.ticket;
    if (!ticket) {
      throw new NotFoundError('Ticket não encontrado para este pagamento');
    }

    const conversation = ticket.conversation;
    if (!conversation) {
      throw new NotFoundError('Conversa não encontrada');
    }

    const isParticipant = 
      conversation.user1_id === req.user.id || 
      conversation.user2_id === req.user.id;

    if (!isParticipant) {
      throw new ForbiddenError('Você não tem permissão para acessar este pagamento');
    }

    req.payment = payment;
    req.ticket = ticket;
    req.conversation = conversation;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkStepOwnership,
  checkTicketOwnership,
  checkPaymentOwnership
};
