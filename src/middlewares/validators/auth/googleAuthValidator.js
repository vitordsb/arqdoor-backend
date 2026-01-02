const Joi = require("joi");

const googleAuthValidator = (req, res, next) => {
  try {
    const { idToken, type } = req.body || {};

    const schema = Joi.object({
      idToken: Joi.string().required(),
      type: Joi.string().valid("contratante", "prestador").optional(),
    });

    const { error, value } = schema.validate({ idToken, type });
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
