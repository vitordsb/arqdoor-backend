const { Op } = require("sequelize");
const Conversation = require("../../models/Conversation");
const User = require("../../models/User");

const createConversationService = async (data) => {
  try {
    // validar se o user1 existe
    const user1 = await User.findByPk(data.user1_id);
    if (!user1) {
      return {
        code: 404,
        message: "O usuario 1 não foi encontrado",
        success: false,
      };
    }

    const user2 = await User.findByPk(data.user2_id);
    if (!user2) {
      return {
        code: 404,
        message: "O usuario 2 não foi encontrado",
        success: false,
      };
    }

    // validar se os dois usuarios não são os mesmos
    if (user1.id === user2.id) {
      return {
        code: 400,
        message: "Não é possivel criar uma conversa com o própio usuario",
        success: false,
      };
    }

    // validar se os dois já não tem uma conversa criada
    const conversationExists = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1_id: user1.id, user2_id: user2.id },
          { user1_id: user2.id, user2_id: user1.id },
        ],
      },
    });

    if (conversationExists) {
      return {
        code: 200,
        message: "Conversa já existente",
        conversation: conversationExists,
        success: true,
      };
    }

    // validar se e uma conversa de negocios
    if (user1.type !== user2.type) {
      // contratante e prestador
      data.is_negotiation = true;
    }

    // criar conversa
    const conversation = await Conversation.create(data);
    return {
      code: 201,
      message: "Conversa criada com sucesso",
      conversation,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createConversationService;
