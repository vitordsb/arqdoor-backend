const Joi = require("joi");

const updateProviderValidator = async (req, res, next) => {
  try {
    const { profession, about, payment_preference } = req.body || {};

    const schema = Joi.object({
      profession: Joi.string().min(3).max(50).allow("").optional(),
      about: Joi.string().min(10).max(1000).allow("").optional(),
      payment_preference: Joi.string().valid("per_step", "at_end", "custom").optional(),
    });

    const { error, value } = schema.validate({ profession, about, payment_preference });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    const normalizedAbout =
      value.about === undefined
        ? undefined
        : value.about.trim()
          ? value.about.trim()
          : null;

    req.provider = {
      profession: value.profession?.trim()
        ? value.profession.trim()
        : undefined,
      about: normalizedAbout,
      ...(value.payment_preference && { payment_preference: value.payment_preference }),
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "ProviderValidators",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateProviderValidator",
      success: false,
    });
  }
};

module.exports = updateProviderValidator;
