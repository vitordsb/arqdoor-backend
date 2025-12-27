const Joi = require("joi");

const updateSignatureStepValidator = async (req, res, next) => {
  try {
    const { signature, password } = req.body || {};

    const schema = Joi.object({
      signature: Joi.boolean().required(),
      password: Joi.string().required(),
    });

    const { error, value } = schema.validate({
      signature,
      password,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Erro ao validar assinatura",
        error_message: error.details[0].message,
      });
    }

    req.signature = {
      signature,
      password,
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "updateSignatureStepValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateSignatureStepValidator",
      success: false,
    });
  }
};

module.exports = updateSignatureStepValidator;
