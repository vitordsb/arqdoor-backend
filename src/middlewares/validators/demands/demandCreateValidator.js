const Joi = require("joi");

const createDemandValidator = async (req, res, next) => {
  try {
    const { title, description, price } = req.body || {};

    const schema = Joi.object({
      title: Joi.string().min(3).max(100).required(),
      description: Joi.string().min(20).max(500).required(),
      price: Joi.number().min(0).required(),
    });

    const { error, value } = schema.validate({ title, description, price });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.demand = {
      title,
      description,
      price,
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "DemandValidators",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no DemandCreateValidator",
      success: false,
    });
  }
};

module.exports = createDemandValidator;
