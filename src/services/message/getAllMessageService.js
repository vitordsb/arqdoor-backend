const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");

const getAllMessageService = async (conversation_id, user) => {
  try {
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
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 400,
        message: "O usuario logado não esta nessa conversa",
        success: false,
      };
    }

    // pegar todas as mensagens da conversa
    const messages = await Message.findAll({
      where: {
        conversation_id: conversation.conversation_id,
      },
    });

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
