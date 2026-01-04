const Joi = require("joi");

const createMessageValidator = async (req, res, next) => {
  try {
    const { conversation_id, content } = req.body || {};

    const schema = Joi.object({
      conversation_id: Joi.number().required().integer(),
      content: Joi.string().required().max(500),
    });

    const { error, value } = schema.validate({ conversation_id, content });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.message = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "createMessageValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createMessageValidator",
      success: false,
    });
  }
};

module.exports = createMessageValidator;
