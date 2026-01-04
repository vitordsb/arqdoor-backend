const updateMessageService = require("../../services/message/updateMessageService");

const updateMessageController = async (req, res) => {
  try {
    const message = await updateMessageService(
      req.params.id,
      req.message,
      req.user
    );
    return res.status(message.code).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "updateMessageController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateMessageController",
      success: false,
    });
  }
};

module.exports = updateMessageController;
