const Conversation = require("../../models/Conversation");
const ServiceProvider = require("../../models/ServiceProvider");
const TicketService = require("../../models/TicketService");
const User = require("../../models/User");
const { Op } = require("sequelize");
const sequelize = require("../../database/config");

const createTicketService = async (data, user) => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Lock the conversation to serialized attempts for this specific chat
    // This prevents race conditions where two users click "Create" simultaneously
    const conversation = await Conversation.findByPk(data.conversation_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!conversation) {
      await transaction.rollback();
      return {
        code: 404,
        message: "Conversa não encontrada",
        success: false,
      };
    }

    // validar se o user logado faz parte da conversa
    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      await transaction.rollback();
      return {
        code: 400,
        message: "O usuario logado não está nessa conversa",
        success: false,
      };
    }

    // validar se o usuario logado e realmente um provider
    if (user.type !== "prestador") {
      await transaction.rollback();
      console.log('createTicketService check failed. User type:', user.type);
      return {
        code: 400,
        message: `Apenas usuarios prestadores podem criar um ticket de serviço. Tipo atual: ${user.type}`,
        success: false,
      };
    }

    // buscar o userProvider
    const userProvider = await ServiceProvider.findOne({
      where: {
        user_id: user.id,
      },
      transaction,
    });

    if (!userProvider) {
      await transaction.rollback();
      return {
        code: 404,
        message: "Não foi possivel encontrar o usuario provider",
        success: false,
      };
    }

    // validar se é uma conversa de negocios
    if (!conversation.is_negotiation) {
      await transaction.rollback();
      return {
        code: 400,
        message: "Só é possivel criar um ticket em uma conversa de negocios",
        success: false,
      };
    }

    // validar se já tem outro ticket criado (Active Check within Lock)
    const existingTickets = await TicketService.findAll({
      where: {
        conversation_id: conversation.conversation_id,
        [Op.or]: [{ status: "em andamento" }, { status: "pendente" }],
      },
      transaction,
    });

    if (existingTickets.length > 0) {
      await transaction.rollback();
      return {
        code: 400,
        message: "Já existe um ticket em aberto ou em andamento nesta conversa",
        success: false,
      };
    }

    data.provider_id = userProvider.provider_id;
    const requestedPreference = (data.payment_preference || "")
      .toString()
      .toLowerCase();
    const paymentPreference = ["per_step", "at_end", "custom"].includes(
      requestedPreference
    )
      ? requestedPreference
      : (userProvider.payment_preference || "at_end").toString().toLowerCase();

    data.payment_preference = paymentPreference;
    if (paymentPreference === "custom") {
      data.allow_grouped_payment = true;
    }
    data.payment_status =
      paymentPreference === "at_end" ? "awaiting_deposit" : "awaiting_steps";

    const ticketService = await TicketService.create(data, { transaction });

    await transaction.commit();

    return {
      code: 200,
      message: "Ticket criado com sucesso",
      ticketService,
      success: true,
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createTicketService;
