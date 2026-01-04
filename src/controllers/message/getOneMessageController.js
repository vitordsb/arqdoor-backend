const getOneMessageService = require("../../services/message/getOneMessageService");

const getOneMessageController = async (req, res) => {
  try {
    const message = await getOneMessageService(req.params.id, req.user);
    return res.status(message.code).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "getOneMessageController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getOneMessageController",
      success: false,
    });
  }
};

module.exports = getOneMessageController;