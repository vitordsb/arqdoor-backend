const Joi = require("joi");

const createUserValidation = (req, res, next) => {
  try {
    const { name, email, password, cpf, cnpj, type, gender, birth } =
      req.body || {};
 

    const schema = Joi.object({
      name: Joi.string().min(3).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(50).required(),
      cpf: Joi.string()
        .pattern(/^\d{11}$/)
        .allow("", null)
        .optional(),
      cnpj: Joi.string()
        .pattern(/^\d{14}$/)
        .allow("", null)
        .optional(),
      type: Joi.string()
        .valid("contratante", "prestador") // exemplos de valores
        .required(),
      gender: Joi.string()
        .valid("Masculino", "Feminino", "Prefiro não dizer")
        .required(),
      birth: Joi.date()
        .less("now") // precisa ser antes da data atual
        .required(),
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
            middleware: "UserValidators",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no UserCreateValidator",
      success: false,
    });
  }
};

module.exports = createUserValidation;
