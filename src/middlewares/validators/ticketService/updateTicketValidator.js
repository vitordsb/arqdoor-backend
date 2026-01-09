const Joi = require("joi");

const updateTicketValidator = async (req, res, next) => {
  try {
    const { status, allow_grouped_payment } = req.body || {};

    const schema = Joi.object({
      status: Joi.string()
        .regex(/pendente|em andamento|concluída|cancelada/),
      allow_grouped_payment: Joi.boolean(),
    });

    const { error, value } = schema.validate({ status, allow_grouped_payment });

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
            middleware: "updateTicketValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateTicketValidator",
      success: false,
    });
  }
};

module.exports = updateTicketValidator;
