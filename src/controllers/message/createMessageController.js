const createMessageService = require("../../services/message/createMessageService");

const createMessageController = async (req, res) => {
  try {
    const message = await createMessageService(req.message, req.user);
    return res.status(message.code).json(message);
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "createMessageController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createMessageController",
      success: false,
    });
  }
};

module.exports = createMessageController