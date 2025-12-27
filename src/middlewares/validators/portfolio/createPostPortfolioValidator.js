const Joi = require("joi");

const createPostPortfolioValidator = async (req, res, next) => {
  try {
    const { image_id, description, title } = req.body || {};

    const schema = Joi.object({
      image_id: Joi.number().integer().required(),
      description: Joi.string().max(500),
      title: Joi.string().max(200).required(),
    });

    const { error, value } = schema.validate({ image_id, description, title });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.postPortfolio = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            validator: "createPostPortfolioValidator",
            message: error.message,
          },
        ],
      },
      message: "Erro no createPostPortfolioValidator",
      success: false,
    });
  }
};

module.exports = createPostPortfolioValidator;
