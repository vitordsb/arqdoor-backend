const Joi = require("joi");

const updateSignatureAttachmentValidator = async (req, res,next) => {
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

    req.signature = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "updateSignatureAttachmentValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateSignatureAttachmentValidator",
      success: false,
    });
  }
};

module.exports = updateSignatureAttachmentValidator;
