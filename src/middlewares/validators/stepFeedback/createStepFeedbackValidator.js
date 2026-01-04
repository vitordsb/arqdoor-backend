const Joi = require("joi");

const createStepFeedbackValidator = async (req, res, next) => {
  try {
    const { comment, type } = req.body || {};

    const schema = Joi.object({
      comment: Joi.string().required().min(3).max(200),
      type: Joi.string().valid("feedback", "issue").default("feedback"),
    });

    const { error, value } = schema.validate({ comment, type });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: error.details[0].message,
        success: false,
      });
    }

    req.feedbackPayload = value;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "createStepFeedbackValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createStepFeedbackValidator",
      success: false,
    });
  }
};

module.exports = createStepFeedbackValidator;
