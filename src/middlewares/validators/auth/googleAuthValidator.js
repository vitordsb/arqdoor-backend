const Joi = require("joi");

const googleAuthValidator = (req, res, next) => {
  try {
    const { idToken, accessToken, type, mode } = req.body || {};

    const schema = Joi.object({
      idToken: Joi.string(),
      accessToken: Joi.string(),
      type: Joi.string().valid("contratante", "prestador").optional(),
      mode: Joi.string().valid("login", "register").optional(),
    }).or("idToken", "accessToken");

    const { error, value } = schema.validate({ idToken, accessToken, type, mode });
    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Token do Google é obrigatório",
        success: false,
      });
    }

    req.googleAuth = value;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "Erro no GoogleAuthValidator",
      success: false,
    });
  }
};

module.exports = googleAuthValidator;
