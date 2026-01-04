const getAllStepService = require("../../services/step/getAllStepService");

const getAllStepController = async (req, res) => {
  try {
    const steps = await getAllStepService(req.params.id, req.user);
    return res.status(steps.code).json(steps);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getAllStepController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllStepController",
      success: false,
    });
  }
};

module.exports = getAllStepController;
