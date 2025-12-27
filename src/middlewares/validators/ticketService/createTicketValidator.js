const Joi = require("joi");

const createTicketValidator = async (req, res, next) => {
  try {
    const { conversation_id } = req.body || {};

    const schema = Joi.object({
      conversation_id: Joi.number().integer().required(),
    });

    const { error, value } = schema.validate({ conversation_id });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.ticket = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "createTicketValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createTicketValidator",
      success: false,
    });
  }
};

module.exports = createTicketValidator;
