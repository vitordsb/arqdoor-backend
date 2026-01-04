const Joi = require("joi");

const updateServiceValidator = async (req, res, next) => {
  try {
    const { title, description, price } = req.body || {};

    const schema = Joi.object({
      title: Joi.string().min(3).max(50),
      description: Joi.string().min(30).max(400),
      price: Joi.number().min(1),
    });

    const { error, value } = schema.validate({ title, description, price });
    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.serviceFreelancer = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "ServiceFreelancerValidators",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateServiceValidator",
      success: false,
    });
  }
};

module.exports = updateServiceValidator;
