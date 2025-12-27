const Joi = require("joi");

const updatePostPortfolioValidator = async (req, res, next) => {
  try {
    const { title, description, image_id } = req.body || {};

    const schema = Joi.object({
      title: Joi.string().min(3).max(200).optional(),
      description: Joi.string().allow("").max(500).optional(),
      image_id: Joi.number().integer().optional(),
    });

    const { error, value } = schema.validate({ title, description, image_id });

    if (error) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: error.details[0].message,
      });
    }

    req.updatePortfolio = {
      title: value.title?.trim(),
      description:
        value.description !== undefined ? value.description.trim() : undefined,
      image_id: value.image_id,
    };

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro no updatePostPortfolioValidator",
    });
  }
};

module.exports = updatePostPortfolioValidator;
