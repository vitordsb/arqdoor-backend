const Joi = require("joi");

const updateUserValidation = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      cpf,
      cnpj,
      termos_aceitos,
      is_email_verified,
      birth,
      gender,
      type,
    } = req.body || {};

    const schema = Joi.object({
      name: Joi.string().min(3).max(100),
      email: Joi.string().email(),
      password: Joi.string().min(6).max(50),
      cpf: Joi.string()
        .pattern(/^\d{11}$/)
        .allow("", null)
        .optional(),
      cnpj: Joi.string()
        .pattern(/^\d{14}$/)
        .allow("", null)
        .optional(),
      type: Joi.string().valid("contratante", "prestador"), // exemplos de valores
      gender: Joi.string().valid("Masculino", "Feminino", "Prefiro não dizer"),
      birth: Joi.date().less("now"), // precisa ser antes da data atual
    });

    const { error, value } = schema.validate({
      name,
      email,
      password,
      cpf,
      cnpj,
      type,
      gender,
      birth,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.user = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            validator: "user",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateUserValidator",
      success: false,
    });
  }
};

module.exports = updateUserValidation;
