const updateStepFeedbackService = require("../../services/stepFeedback/updateStepFeedbackService");

const updateStepFeedbackController = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const result = await updateStepFeedbackService(id, payload, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "updateStepFeedbackController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateStepFeedbackController",
      success: false,
    });
  }
};

module.exports = updateStepFeedbackController;
