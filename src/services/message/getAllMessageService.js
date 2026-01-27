const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const { Op } = require("sequelize");

const getAllMessageService = async (conversation_id, user) => {
  try {
    const userId = Number(user?.id);
    if (!Number.isFinite(userId)) {
      return {
        code: 400,
        message: "Usuário inválido",
        success: false,
      };
    }

    // buscar a conversa e validar
    const conversation = await Conversation.findByPk(conversation_id);

    if (!conversation) {
      return {
        code: 404,
        message: "Conversa não encontrada",
        success: false,
      };
    }

    // validar se a conversa envolve o usuario logado
    if (
      Number(conversation.user1_id) !== userId &&
      Number(conversation.user2_id) !== userId
    ) {
      return {
        code: 400,
        message: "O usuario logado não esta nessa conversa",
        success: false,
      };
    }

    // Pegar todas as mensagens da conversa
    const messages = await Message.findAll({
      where: {
        conversation_id: conversation.conversation_id,
      },
    });

    // Marcar como lida as mensagens que não são minhas
    await Message.update(
      { read: true },
      {
        where: {
          conversation_id: conversation.conversation_id,
          sender_id: { [Op.ne]: userId },
          read: false,
        },
      }
    );

    return {
      code: 200,
      message: "Todas as mensagens da conversa",
      messages,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllMessageService;
