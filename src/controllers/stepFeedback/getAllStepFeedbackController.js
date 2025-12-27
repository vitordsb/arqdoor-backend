const getAllStepFeedbackService = require("../../services/stepFeedback/getAllStepFeedbackService");

const getAllStepFeedbackController = async (req, res) => {
  try {
    const result = await getAllStepFeedbackService(req.params.id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getAllStepFeedbackController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllStepFeedbackController",
      success: false,
    });
  }
};

module.exports = getAllStepFeedbackController;
