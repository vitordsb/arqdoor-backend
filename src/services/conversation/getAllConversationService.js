const Conversation = require("../../models/Conversation");
const { Op } = require("sequelize");
const Message = require("../../models/Message");
const getAllConversationService = async (user) => {
  try {
    // console.log(`[DEBUG] getAllConversation for user: ${user.id}`);
    // buscar todas as conversas do usuario logado
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user1_id: user.id }, { user2_id: user.id }],
      },
    });

    // Calcular unread_count para cada conversa
    const conversationsWithCount = await Promise.all(
      conversations.map(async (conv) => {
        const plainConv = conv.toJSON();
        const unreadCount = await Message.count({
          where: {
            conversation_id: plainConv.conversation_id || plainConv.id, // Fallback se id nao estiver mapeado no model padrão sequelize (geralmente id)
            sender_id: { [Op.ne]: user.id },
            read: false,
          },
        });
        // console.log(`[DEBUG] Conv ${plainConv.conversation_id}: unread=${unreadCount}`);
        plainConv.unread_count = unreadCount;
        return plainConv;
      })
    );

    return {
      code: 200,
      message: "Todas as conversas do usuario logado",
      conversations: conversationsWithCount,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllConversationService;
