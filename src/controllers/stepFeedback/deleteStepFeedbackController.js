const deleteStepFeedbackService = require("../../services/stepFeedback/deleteStepFeedbackService");

const deleteStepFeedbackController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteStepFeedbackService(id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "deleteStepFeedbackController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no deleteStepFeedbackController",
      success: false,
    });
  }
};

module.exports = deleteStepFeedbackController;
