const ServiceProvider = require("../../models/ServiceProvider");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const Payment = require("../../models/Payment");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const { isPaidStatus } = require("../../utils/asaasStatuses");
const asaasClient = require("../../config/asaas");
const dayjs = require("dayjs");

const updateConfirmFreelancerService = async (step_id, dataUpdate, user) => {
  try {
    // Buscar a etapa
    const step = await Step.findByPk(step_id);
    if (!step) {
      return {
        code: 404,
        message: "Step não encontrado",
        success: false,
      };
    }

    // Buscar o ticket
    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      return {
        code: 404,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    // Buscar o provider
    const userProvider = await ServiceProvider.findByPk(ticket.provider_id);
    if (!userProvider) {
      return {
        code: 404,
        message: "UserProvider não encontrado",
        success: false,
      };
    }

    // Validar se o usuario logado e o mesmo 'dono' do ticket
    if (userProvider.user_id !== user.id) {
      return {
        code: 400,
        message: "Acesso negado, o usuario logado não e dono do ticket",
      };
    }

    // Buscar o usuario
    const userTicket = await User.findByPk(userProvider.user_id);
    if (!userTicket) {
      return {
        code: 404,
        message: "userTicket não encontrado",
        success: false,
      };
    }

    // Validar se a senha enviada e a mesma do usuario dono do ticket
    if (!bcrypt.compareSync(dataUpdate.password, userTicket.password)) {
      return {
        code: 400,
        message: "Senha incorreta",
        success: false,
      };
    }

    const refreshPreviousStepPayment = async (prevStepId) => {
      try {
        const payment = await Payment.findOne({
          where: { step_id: prevStepId },
          order: [["created_at", "DESC"]],
        });
        if (!payment || !payment.asaas_payment_id) return false;

        const asaaspayment = await asaasClient.get(`/payments/${payment.asaas_payment_id}`);
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
        await payment.update(updateData);
        return isPaidStatus(updateData.status);
      } catch (e) {
        console.warn("Falha ao atualizar pagamento da etapa anterior:", e);
        return false;
      }
    };

    // Se a preferência for pagamento por etapa, bloqueia avanço sem pagamento anterior
    const prefersPerStep = (userProvider.payment_preference || "").toLowerCase() === "per_step";
    if (prefersPerStep) {
      const allSteps = await Step.findAll({
        where: { ticket_id: ticket.id },
        order: [["id", "ASC"]],
      });
      const currentIndex = allSteps.findIndex((s) => s.id === step.id);
      const previousStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;

      if (previousStep && Number(previousStep.price || 0) > 0) {
        const prevPayments = await Payment.findAll({ where: { step_id: previousStep.id } });
        const hasPaid = prevPayments.some((p) => isPaidStatus(p.status));
        const paid = hasPaid || (await refreshPreviousStepPayment(previousStep.id));
        if (!paid) {
          return {
            code: 400,
            message: "Pagamento pendente da etapa anterior. Conclua o pagamento para continuar.",
            success: false,
          };
        }
      }
    }

    // Atualizar o confirm_freelancer + contar tentativas de conclusão
    const shouldIncrement =
      dataUpdate.confirm_freelancer === true && !step.confirm_freelancer;
    const currentRework = step.rework_count || 0;

    await step.update({
      confirm_freelancer: dataUpdate.confirm_freelancer,
      rework_count: shouldIncrement ? currentRework + 1 : currentRework,
    });

    return {
      code: 200,
      message: "confirm_freelancer atualizado com sucesso",
      success: true,
      step,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateConfirmFreelancerService;
