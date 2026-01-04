const Conversation = require("../../models/Conversation");
const Payment = require("../../models/Payment");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const { isPaidStatus } = require("../../utils/asaasStatuses");

const getStepPaymentsService = async (stepId, user) => {
  try {
    const step = await Step.findByPk(stepId);
    if (!step) {
      return {
        code: 404,
        message: "Etapa não encontrada",
        success: false,
      };
    }

    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      return {
        code: 404,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation) {
      return {
        code: 404,
        message: "Conversa não encontrada",
        success: false,
      };
    }

    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 403,
        message: "O usuário não participa desta conversa",
        success: false,
      };
    }

    const payments = await Payment.findAll({
      where: { step_id: step.id },
      order: [["created_at", "DESC"]],
    });

    const totalPaid = payments.filter((payment) =>
      isPaidStatus(payment.status)
    ).length;

    return {
      code: 200,
      success: true,
      message: "Histórico de pagamentos encontrado",
      data: {
        step_id: step.id,
        ticket_id: ticket.id,
        payments,
        summary: {
          total_attempts: payments.length,
          paid_attempts: totalPaid,
          has_successful_payment: totalPaid > 0,
        },
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getStepPaymentsService;
