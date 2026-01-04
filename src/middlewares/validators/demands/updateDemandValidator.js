const Joi = require("joi");

const updateDemandValidator = async (req, res, next) => {
  try {
    const { title, description, price } = req.body || {};
    const errors = [];
    const schema = Joi.object({
      title: Joi.string().min(3).max(100),
      description: Joi.string().min(20).max(500),
      price: Joi.number().min(0),
    });

    const { error, value } = schema.validate({ title, description, price });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    if (errors.length !== 0) {
      return res.status(400).json({
        code: 400,
        errors,
        message: "Erro ao validar a demanda",
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
      message: "Erro no updateDemandValidator",
      success: false,
    });
  }
};

module.exports = updateDemandValidator;
