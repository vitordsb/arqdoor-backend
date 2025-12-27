const Joi = require("joi");

const createProviderValidator = async (req, res, next) => {
  try {
    const { user_id, profession, views_profile, about, rating_mid } =
      req.body || {};

    const schema = Joi.object({
      user_id: Joi.number().integer().required(),
      profession: Joi.string().min(3).max(50),
      about: Joi.string().min(30).max(300),
      views_profile: Joi.number(),
      rating_mid: Joi.number(),
    });

    const { error, value } = schema.validate({
      user_id,
      profession,
      views_profile,
      about,
      rating_mid,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.provider = value;

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
      message: "Erro no ProviderCreateValidator",
      success: false,
    });
  }
};

module.exports = createProviderValidator;
