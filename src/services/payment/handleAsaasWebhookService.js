const dayjs = require("dayjs");
const Payment = require("../../models/Payment");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const Message = require("../../models/Message");
const { isPaidStatus } = require("../../utils/asaasStatuses");

const handleAsaasWebhookService = async (payload) => {
  try {
    const { event, payment } = payload || {};

    if (!event || !payment || !payment.id) {
      return {
        code: 400,
        success: false,
        message: "Payload do webhook inválido",
      };
    }

    const currentPayment = await Payment.findOne({
      where: { asaas_payment_id: payment.id },
    });

    if (!currentPayment) {
      return {
        code: 404,
        success: false,
        message: "Pagamento não localizado",
      };
    }

    const updateData = {
      status: payment.status || currentPayment.status,
      last_event: event,
      raw_response: JSON.stringify(payment),
      webhook_payload: JSON.stringify(payload),
    };

    if (payment.paymentDate || payment.clientPaymentDate) {
      const paidDate = payment.clientPaymentDate || payment.paymentDate;
      updateData.paid_at = dayjs(paidDate).toDate();
    }

    if (payment.dueDate) {
      updateData.due_date = dayjs(payment.dueDate).toDate();
    }

    await currentPayment.update(updateData);

    // Se pagou, verifica se todas as etapas do ticket estão concluídas para fechar o ticket
    if (isPaidStatus(updateData.status) && currentPayment.ticket_id) {
      // Se for pagamento de etapa, marca a etapa como concluída
      if (currentPayment.step_id) {
        try {
          const paidStep = await Step.findByPk(currentPayment.step_id);
          if (paidStep) {
            await paidStep.update({
              status: "Concluido",
              confirm_contractor: true,
            });
          }
        } catch (e) {
          console.warn("Falha ao marcar etapa como concluída após pagamento:", e);
        }
      }

      // Depósito em garantia libera o andamento do ticket
      const isDeposit =
        (currentPayment.description || "")
          .toLowerCase()
          .includes("depósito em garantia");
      if (isDeposit) {
        try {
          await TicketService.update(
            { status: "em andamento", payment: true },
            { where: { id: currentPayment.ticket_id } }
          );

          // Envia mensagem na conversa avisando do pagamento confirmado
          try {
            const ticket = await TicketService.findByPk(currentPayment.ticket_id);
            if (ticket?.conversation_id) {
              const senderId = currentPayment.contractor_id || currentPayment.provider_id;
              if (senderId) {
                await Message.create({
                  conversation_id: ticket.conversation_id,
                  sender_id: senderId,
                  content: `💰 Pagamento do depósito em garantia confirmado para o Ticket #${currentPayment.ticket_id}. Projeto liberado.`,
                });
              }
            }
          } catch (e) {
            console.warn("Falha ao enviar mensagem de pagamento confirmado", e);
          }
        } catch (e) {
          console.warn("Falha ao atualizar ticket após depósito", e);
        }
      }

      try {
        const steps = await Step.findAll({ where: { ticket_id: currentPayment.ticket_id } });
        const allConcluded = steps.length > 0 && steps.every(
          (s) => (s.status || "").toLowerCase() === "concluido"
        );
        if (allConcluded) {
          await TicketService.update(
            { status: "concluída" },
            { where: { id: currentPayment.ticket_id } }
          );
        }
      } catch (e) {
        console.warn("Falha ao atualizar ticket após pagamento", e);
      }
    }

    return {
      code: 200,
      success: true,
      message: "Webhook processado",
      data: {
        step_id: currentPayment.step_id,
        ticket_id: currentPayment.ticket_id,
        status: updateData.status,
        paid: isPaidStatus(updateData.status),
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = handleAsaasWebhookService;
