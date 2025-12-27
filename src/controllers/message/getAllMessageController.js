const getAllMessageService = require("../../services/message/getAllMessageService");

const getAllMessageController = async (req, res) => {
  try {
    const messages = await getAllMessageService(req.params.id, req.user);
    return res.status(messages.code).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "getAllMessageController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllMessageController",
      success: false,
    });
  }
};

module.exports = getAllMessageController;
