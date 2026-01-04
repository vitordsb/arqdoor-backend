const Joi = require("joi");

const ticketIdParamValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      ticketId: Joi.number().integer().positive().required(),
    });

    const { error, value } = schema.validate({
      ticketId: Number(req.params.ticketId),
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Parâmetro ticketId inválido",
        details: error.details,
        success: false,
      });
    }

    req.ticketId = value.ticketId;

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro no ticketIdParamValidator",
    });
  }
};

module.exports = ticketIdParamValidator;
