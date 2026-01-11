// updateConfirmFreelancerValidator.js
const Joi = require("joi");

const updateConfirmFreelancerValidator = async (req, res, next) => {
  try {
    const { confirm_freelancer, confirmFreelancer, password } = req.body || {};
    const normalizedConfirm =
      typeof confirm_freelancer === "boolean" ? confirm_freelancer : confirmFreelancer;

    const schema = Joi.object({
      confirm_freelancer: Joi.boolean().required(),
      password: Joi.string().required(),
    });

    const { error, value } = schema.validate({
      confirm_freelancer: normalizedConfirm,
      password,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Erro ao validar confirm_freelancer",
        error_message: error.details[0].message,
      });
    }

    req.confirmFreelancer = {
      confirm_freelancer,
      password,
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "updateConfirmFreelancerValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateConfirmFreelancerValidator",
      success: false,
    });
  }
};

module.exports = updateConfirmFreelancerValidator;
