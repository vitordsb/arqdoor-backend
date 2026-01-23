const ServiceProvider = require("../../models/ServiceProvider");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const Payment = require("../../models/Payment");
const PaymentStep = require("../../models/PaymentStep");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const { isPaidStatus } = require("../../utils/asaasStatuses");
const asaasClient = require("../../config/asaas");
const dayjs = require("dayjs");

const updateConfirmFreelancerService = async (step_id, dataUpdate, user) => {
  try {
    console.log(`[DEBUG] updateConfirmFreelancerService started. StepID: ${step_id}, UserID: ${user?.id}`);

    const step = await Step.findByPk(step_id);
    if (!step) {
      console.log("[DEBUG] Step not found");
      return {
        code: 404,
        message: "Step não encontrado",
        success: false,
      };
    }
    console.log(`[DEBUG] Step found: ${step.id}, TicketID: ${step.ticket_id}`);

    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      console.log("[DEBUG] Ticket not found");
      return {
        code: 404,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    const userProvider = await ServiceProvider.findByPk(ticket.provider_id);
    if (!userProvider) {
      console.log("[DEBUG] UserProvider not found");
      return {
        code: 404,
        message: "UserProvider não encontrado",
        success: false,
      };
    }
    console.log(`[DEBUG] UserProvider found: ${userProvider.id}, UserProvider.user_id: ${userProvider.user_id}`);

    if (userProvider.user_id !== user.id) {
      console.log(`[DEBUG] Access denied. ProviderUser: ${userProvider.user_id} !== RequestUser: ${user.id}`);
      return {
        code: 400,
        message: "Acesso negado, o usuario logado não e dono do ticket",
      };
    }

    const userTicket = await User.findByPk(userProvider.user_id);
    if (!userTicket) {
      return {
        code: 404,
        message: "userTicket não encontrado",
        success: false,
      };
    }

    const signatureReady =
      userTicket.signature_password_set === true && !!userTicket.password;
    if (!signatureReady) {
      return {
        code: 400,
        message: "Você não configurou sua senha de assinatura.",
        success: false,
      };
    }

    const trimmedPassword = (dataUpdate.password || "").trim();
    if (!trimmedPassword) {
      return {
        code: 400,
        message: "Senha de assinatura obrigatória.",
        success: false,
      };
    }

    if (!bcrypt.compareSync(trimmedPassword, userTicket.password)) {
      return {
        code: 400,
        message: "Senha incorreta",
        success: false,
      };
    }

    const refreshPreviousStepPayment = async (prevStepId) => {
      try {
        const directPayments = await Payment.findAll({
          where: { step_id: prevStepId }
        });

        const paymentSteps = await PaymentStep.findAll({ where: { step_id: prevStepId } });
        const groupedPaymentIds = paymentSteps.map((ps) => ps.payment_id);
        const groupedPayments = await Payment.findAll({
          where: { id: groupedPaymentIds }
        });

        const allPayments = [...directPayments, ...groupedPayments].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        const payment = allPayments[0];

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

    const paymentPreference = (
      ticket.payment_preference ||
      userProvider.payment_preference ||
      ""
    )
      .toString()
      .toLowerCase();
    const prefersPerStep = paymentPreference === "per_step";
    const isCustom = paymentPreference === "custom";

    if (
      isCustom &&
      dataUpdate.confirm_freelancer &&
      Number(step.price || 0) > 0 &&
      !step.is_financially_cleared
    ) {
      return {
        code: 400,
        message: "Pagamento necessário antes de concluir a etapa.",
        success: false,
      };
    }
    if (prefersPerStep) {
      const allSteps = await Step.findAll({
        where: { ticket_id: ticket.id },
        order: [["id", "ASC"]],
      });
      const currentIndex = allSteps.findIndex((s) => s.id === step.id);
      const previousStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;

      if (previousStep && Number(previousStep.price || 0) > 0) {
        const directPrevPayments = await Payment.findAll({ where: { step_id: previousStep.id } });
        
        const prevPaymentSteps = await PaymentStep.findAll({ where: { step_id: previousStep.id } });
        const prevGroupedIds = prevPaymentSteps.map(ps => ps.payment_id);
        const groupedPrevPayments = await Payment.findAll({ where: { id: prevGroupedIds } });

        const prevPayments = [...directPrevPayments, ...groupedPrevPayments];

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

    const shouldIncrement =
      dataUpdate.confirm_freelancer === true && !step.confirm_freelancer;
    const currentRework = step.rework_count || 0;

    const updateDataStep = {
      confirm_freelancer: dataUpdate.confirm_freelancer,
      rework_count: shouldIncrement ? currentRework + 1 : currentRework,
    };

    if (dataUpdate.confirm_freelancer) {
      updateDataStep.status = "Em Andamento";
      updateDataStep.confirm_contractor = false; 
    }

    await step.update(updateDataStep);

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
