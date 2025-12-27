const Joi = require("joi");

const createStepPaymentValidator = async (req, res, next) => {
  try {
    const schema = Joi.object({
      description: Joi.string().max(255).allow("", null),
      method: Joi.string()
        .valid("PIX", "pix", "BOLETO", "boleto", "CREDIT_CARD", "credit_card", "DEBIT_CARD", "debit_card")
        .optional(),
    });

    const { error, value } = schema.validate(req.body || {});

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.stepPaymentPayload = {
      description: value.description ? value.description.trim() : undefined,
      method: value.method,
    };
    req.paymentPayload = req.stepPaymentPayload;

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro no createStepPaymentValidator",
    });
  }
};

module.exports = createStepPaymentValidator;
