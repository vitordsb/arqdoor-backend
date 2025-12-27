const createStepFeedbackService = require("../../services/stepFeedback/createStepFeedbackService");

const createStepFeedbackController = async (req, res) => {
  try {
    const result = await createStepFeedbackService(
      req.params.id,
      req.feedbackPayload,
      req.user
    );
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "createStepFeedbackController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createStepFeedbackController",
      success: false,
    });
  }
};

module.exports = createStepFeedbackController;
