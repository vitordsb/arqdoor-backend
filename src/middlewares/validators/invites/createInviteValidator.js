const Joi = require("joi");

const createInviteValidator = async (req, res, next) => {
  try {
    const { title, description, payment_preference, steps } = req.body || {};

    const schema = Joi.object({
      title: Joi.string().max(120).allow("", null),
      description: Joi.string().max(2000).allow("", null),
      payment_preference: Joi.string().valid("per_step", "at_end").optional(),
      steps: Joi.any().required(),
    });

    const { error, value } = schema.validate({
      title,
      description,
      payment_preference,
      steps,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.invite = value;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no createInviteValidator",
      success: false,
    });
  }
};

module.exports = createInviteValidator;
