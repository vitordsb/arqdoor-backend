const sequelize = require("../../database/config");
const { Op } = require("sequelize");
const GhostInvite = require("../../models/GhostInvite");
const Conversation = require("../../models/Conversation");
const ServiceProvider = require("../../models/ServiceProvider");
const TicketService = require("../../models/TicketService");
const TicketAttachment = require("../../models/TicketAttachment");
const Step = require("../../models/Step");
const User = require("../../models/User");
const updateTicketTotal = require("../../utils/updateTIcketTotal");

const SIGNATURE_STEP_TITLE = "Assinatura do contrato (PDF)";

const ensureCpf = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) return { ok: false, message: "Usuário não encontrado." };
  const cpf = (user.cpf || "").toString().replace(/\D/g, "");
  if (!cpf || cpf.length !== 11) {
    return { ok: false, message: "CPF é obrigatório para assinar o contrato." };
  }
  return { ok: true, user };
};

const acceptInviteService = async (token, user) => {
  const transaction = await sequelize.transaction();
  try {
    const invite = await GhostInvite.findOne({
      where: { token },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!invite) {
      await transaction.rollback();
      return {
        code: 404,
        message: "Convite não encontrado.",
        success: false,
      };
    }

    if (invite.status !== "active") {
      await transaction.rollback();
      return {
        code: 400,
        message: "Convite indisponível para assinatura.",
        success: false,
      };
    }

    if (invite.user_id === user.id) {
      await transaction.rollback();
      return {
        code: 400,
        message: "Você não pode aceitar o próprio convite.",
        success: false,
      };
    }

    const cpfCheck = await ensureCpf(user.id);
    if (!cpfCheck.ok) {
      await transaction.rollback();
      return { code: 400, message: cpfCheck.message, success: false };
    }

    if (!invite.contract_pdf_path) {
      await transaction.rollback();
      return {
        code: 400,
        message: "Este convite não possui contrato anexado.",
        success: false,
      };
    }

    const provider = await ServiceProvider.findByPk(invite.provider_id, { transaction });
    if (!provider) {
      await transaction.rollback();
      return {
        code: 404,
        message: "Prestador não encontrado.",
        success: false,
      };
    }
    const paymentPreference =
      invite.payment_preference || provider.payment_preference || "at_end";
    const initialStatus = paymentPreference === "at_end" ? "pendente" : "em andamento";

    const providerUserId = provider.user_id;

    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1_id: providerUserId, user2_id: user.id },
          { user1_id: user.id, user2_id: providerUserId },
        ],
      },
      transaction,
    });

    if (!conversation) {
      conversation = await Conversation.create(
        {
          user1_id: providerUserId,
          user2_id: user.id,
          is_negotiation: true,
        },
        { transaction }
      );
    } else if (!conversation.is_negotiation) {
      await conversation.update({ is_negotiation: true }, { transaction });
    }

    const ticket = await TicketService.create(
      {
        conversation_id: conversation.conversation_id,
        provider_id: provider.provider_id,
        status: initialStatus,
        payment_preference: paymentPreference,
        payment_status:
          paymentPreference === "at_end" ? "awaiting_deposit" : "awaiting_steps",
      },
      { transaction }
    );

    const now = new Date();
    await Step.create(
      {
        ticket_id: ticket.id,
        title: SIGNATURE_STEP_TITLE,
        price: 0,
        status: "Concluido",
        signature: true,
        confirm_contractor: true,
        signatureUpdateAt: now,
        start_date: now,
        end_date: now,
      },
      { transaction }
    );

    const steps = Array.isArray(invite.steps) ? invite.steps : [];
    if (!steps.length) {
      await transaction.rollback();
      return {
        code: 400,
        message: "Convite sem etapas cadastradas.",
        success: false,
      };
    }

    const stepPayload = steps.map((step) => ({
      ticket_id: ticket.id,
      title: step.title,
      price: Number(step.price) || 0,
      status: "Pendente",
      start_date: step.start_date || null,
      end_date: step.end_date || null,
      // Don't persist group_id - payment groups are only for invite display
      // Actual ticket steps don't need group references
    }));

    await Step.bulkCreate(stepPayload, { transaction });

    await TicketAttachment.create(
      {
        ticket_id: ticket.id,
        pdf_path: invite.contract_pdf_path,
        signature: true,
        signatureUpdateAt: now,
        date: now,
      },
      { transaction }
    );

    await invite.update(
      {
        status: "accepted",
        contractor_id: user.id,
        conversation_id: conversation.conversation_id,
        ticket_id: ticket.id,
        accepted_at: now,
      },
      { transaction }
    );

    await transaction.commit();

    try {
      await updateTicketTotal(ticket);
    } catch (error) {
      console.warn("Falha ao atualizar totais do ticket:", error?.message || error);
    }

    return {
      code: 200,
      message: "Convite aceito com sucesso.",
      success: true,
      data: {
        ticket_id: ticket.id,
        conversation_id: conversation.conversation_id,
        provider_user_id: providerUserId,
      },
    };
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro ao aceitar convite.",
      success: false,
    };
  }
};

module.exports = acceptInviteService;
