const Joi = require("joi");

const updateLocationUserValidator = async (req, res, next) => {
  try {
    const { cep, state, city, neighborhood, street, number, typeLocation } =
      req.body || {};

    const schema = Joi.object({
      cep: Joi.string()
        .length(8) // exatamente 8 caracteres
        .pattern(/^[0-9]+$/), // apenas números
      state: Joi.string()
        .length(2)
        .pattern(/^[A-Z]+/),
      city: Joi.string().min(3).max(58),
      neighborhood: Joi.string().min(3).max(58),
      street: Joi.string().min(3).max(85),
      number: Joi.number().min(1),
      typeLocation: Joi.string().regex(/Residencial|Comercial/),
    });

    const { error, value } = schema.validate({
      cep,
      state,
      city,
      neighborhood,
      street,
      number,
      typeLocation,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.locationUser = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "updateLocationUserValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateLocationUserValidator",
      success: false,
    });
  }
};

module.exports = updateLocationUserValidator;
