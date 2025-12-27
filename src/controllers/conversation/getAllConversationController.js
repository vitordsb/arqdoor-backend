const getAllConversationService = require("../../services/conversation/getAllConversationService");

const getAllConversationController = async (req, res) => {
  try {
    const conversation = await getAllConversationService(req.user);
    return res.status(conversation.code).json(conversation);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getAllConversationController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllConversationController",
      success: false,
    });
  }
};

module.exports = getAllConversationController;
