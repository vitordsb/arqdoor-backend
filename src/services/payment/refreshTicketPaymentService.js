const dayjs = require("dayjs");
const asaasClient = require("../../config/asaas");
const Payment = require("../../models/Payment");
const TicketService = require("../../models/TicketService");
const Message = require("../../models/Message");
const Step = require("../../models/Step");
const { isPaidStatus } = require("../../utils/asaasStatuses");

const refreshTicketPaymentService = async (ticketId, user) => {
  try {
    const payment = await Payment.findOne({
      where: { ticket_id: ticketId },
      order: [["created_at", "DESC"]],
    });

    if (!payment) {
      return {
        code: 404,
        success: false,
        message: "Nenhum pagamento associado a este ticket.",
      };
    }

    // garante que usuário pertence ao ticket (prestador ou contratante)
    if (
      user.type !== "contratante" &&
      user.type !== "prestador"
    ) {
      return {
        code: 403,
        success: false,
        message: "Usuário sem permissão para consultar este pagamento.",
      };
    }

    const asaaspaymentId = payment.asaas_payment_id;
    if (!asaaspaymentId) {
      return {
        code: 400,
        success: false,
        message: "Pagamento não possui referência no Asaas.",
      };
    }

    const asaaspayment = await asaasClient.get(`/payments/${asaaspaymentId}`);
    const data = asaaspayment.data || {};

    const updateData = {
      status: data.status || payment.status,
      last_event: data.status || payment.last_event,
      raw_response: JSON.stringify(data),
    };

    if (data.paymentDate || data.clientPaymentDate) {
      const paidDate = data.clientPaymentDate || data.paymentDate;
      updateData.paid_at = dayjs(paidDate).toDate();
    }

    if (data.dueDate) {
      updateData.due_date = dayjs(data.dueDate).toDate();
    }

    const wasPaid = isPaidStatus(payment.status);
    await payment.update(updateData);

    const paid = isPaidStatus(updateData.status);
    if (paid && !wasPaid) {
      if (payment.step_id) {
        try {
          const paidStep = await Step.findByPk(payment.step_id);
          if (paidStep) {
            await paidStep.update({
              status: "Concluido",
              confirm_contractor: true,
            });
          }
        } catch (e) {
          console.warn("Falha ao marcar etapa como concluída após refresh de pagamento", e);
        }
      }

      const isDeposit = (payment.description || "")
        .toLowerCase()
        .includes("depósito em garantia");
      if (isDeposit) {
        try {
          await TicketService.update(
            { status: "em andamento", payment: true },
            { where: { id: ticketId } }
          );

          try {
            const ticket = await TicketService.findByPk(ticketId);
            if (ticket?.conversation_id) {
              const senderId = payment.contractor_id || payment.provider_id;
              if (senderId) {
                await Message.create({
                  conversation_id: ticket.conversation_id,
                  sender_id: senderId,
                  content: `💰 Pagamento do depósito em garantia confirmado para o Ticket #${ticketId}. Projeto liberado.`,
                });
              }
            }
          } catch (e) {
            console.warn("Falha ao enviar mensagem de pagamento confirmado (refresh)", e);
          }
        } catch (e) {
          console.warn("Falha ao atualizar ticket após refresh de pagamento", e);
        }
      }
    }

    return {
      code: 200,
      success: true,
      message: paid ? "Pagamento confirmado" : "Pagamento ainda pendente",
      data: {
        paid,
        status: updateData.status,
        payment_id: payment.id,
        asaas_payment_id: payment.asaas_payment_id,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = refreshTicketPaymentService;
