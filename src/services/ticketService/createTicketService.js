const Conversation = require("../../models/Conversation");
const ServiceProvider = require("../../models/ServiceProvider");
const TicketService = require("../../models/TicketService");
const User = require("../../models/User");
const { Op } = require("sequelize");
const createTicketService = async (data, user) => {
  try {
    // validar se conversation existe
    const conversation = await Conversation.findByPk(data.conversation_id);
    if (!conversation) {
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
      return {
        code: 400,
        message: "O usuario logado não está nessa conversa",
        success: false,
      };
    }

    // validar se o usuario logado e realmente um provider
    if (user.type !== "prestador") {
      return {
        code: 400,
        message: "Apenas usuarios prestadores podem criar um ticket de serviço",
        success: false,
      };
    }

    // buscar o userProvider
    const userProvider = await ServiceProvider.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!userProvider) {
      return {
        code: 404,
        message: "Não foi possivel encontrar o usuario provider",
        success: false,
      };
    }

    // validar se é uma conversa de negocios
    if (!conversation.is_negotiation) {
      return {
        code: 400,
        message: "Só é possivel criar um ticket em uma conversa de negocios",
        success: false,
      };
    }

    // validar se já tem outro ticket criado
    // if ((await TicketService.count()) !== 0) {
    //   return {
    //     code: 400,
    //     message:
    //       "Não vai ser possivel criar ticket, já tem um ticket em aberto",
    //     success: false,
    //   };
    // }

    const tickets = await TicketService.findAll({
      where: {
        conversation_id: conversation.conversation_id,
        [Op.or]: [{ status: "em andamento" }, { status: "pendente" }],
      },
    });

    // if (tickets.length !== 0) {
    //   console.log(tickets);
    //   return {
    //     code: 400,
    //     message: "já tem um ticket em aberto ou em andamento",
    //     success: false,
    //   };
    // }

    data.provider_id = userProvider.provider_id;
    data.payment_preference = userProvider.payment_preference || "at_end";

    const ticketService = await TicketService.create(data);

    return {
      code: 200,
      message: "Ticket criado com sucesso",
      ticketService,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createTicketService;
