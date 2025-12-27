const Conversation = require("../../models/Conversation");
const { Op } = require("sequelize");
const getAllConversationService = async (user) => {
  try {
    // buscar todas as conversas do usuario logado
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user1_id: user.id }, { user2_id: user.id }],
      },
    });

    return {
      code: 200,
      message: "Todas as conversas do usuario logado",
      conversations,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllConversationService;
