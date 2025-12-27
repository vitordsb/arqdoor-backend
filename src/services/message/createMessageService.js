const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");

const createMessageService = async (data, user) => {
  try {
    // data => conversation_id, content

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
        message: "O usuario logado não esta nessa conversa",
        success: false,
      };
    }

    data.sender_id = user.id;
    // criar mensagem
    const message = await Message.create(data);

    return {
      code: 200,
      message: "Mensagem criada com sucesso",
      messageUser: message,
      sucess: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createMessageService;
