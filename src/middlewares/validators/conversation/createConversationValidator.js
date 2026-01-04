const Joi = require("joi");

const createConversationValidator = async (req, res, next) => {
  try {
    const { user1_id, user2_id } = req.body || {};

    const schema = Joi.object({
      user1_id: Joi.number().required(),
      user2_id: Joi.number().required(),
    });

    const { error, value } = schema.validate({ user1_id, user2_id });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.conversation = {
      user1_id,
      user2_id,
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "createConversationValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createConversationValidator",
      success: false,
    });
  }
};

module.exports = createConversationValidator;
