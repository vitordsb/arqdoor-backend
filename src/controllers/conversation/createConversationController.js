const createConversationService = require("../../services/conversation/createConversationService");

const createConversationController = async (req, res) => {
  try {
    const conversation = await createConversationService(req.conversation);
    return res.status(conversation.code).json(conversation);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "createConversationController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createConversationController",
      success: false,
    });
  }
};

module.exports = createConversationController;
