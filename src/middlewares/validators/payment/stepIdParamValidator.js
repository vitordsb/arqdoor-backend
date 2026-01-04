const Joi = require("joi");

const stepIdParamValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      stepId: Joi.number().integer().positive().required(),
    });

    const { error, value } = schema.validate({
      stepId: Number(req.params.stepId),
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Parâmetro stepId inválido",
        details: error.details,
        success: false,
      });
    }

    req.stepId = value.stepId;

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro no stepIdParamValidator",
    });
  }
};

module.exports = stepIdParamValidator;
