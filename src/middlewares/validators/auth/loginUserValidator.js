const Joi = require("joi");

const loginUserValidator = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Schema de validação
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error, value } = schema.validate({ email, password });

    
    if (error) {
      return res.status(401).json({
        code: 401,
        message: "Credenciais inválidas",
        success: false,
      });
    }

    req.dataLogin = { email, password };
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "AuthValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no LoginUserValidator",
      success: false,
    });
  }
};

module.exports = loginUserValidator;
