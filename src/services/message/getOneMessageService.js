const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");

const getOneMessageService = async (message_id, user) => {
  try {
    // Buscar a mensagem pelo ID
    const message = await Message.findByPk(message_id);

    if (!message) {
      return {
        code: 404,
        message: "Mensagem não encontrada",
        success: false,
      };
    }

    // Buscar a conversa para validar se o usuário tem acesso
    const conversation = await Conversation.findByPk(message.conversation_id);

    // Validar se a conversa envolve o usuário logado
    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 403,
        message: "O usuário logado não tem acesso a esta mensagem",
        success: false,
      };
    }

    return {
      code: 200,
      message: "Mensagem encontrada com sucesso",
      data: message,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getOneMessageService;