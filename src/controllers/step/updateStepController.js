const updateStepService = require("../../services/step/updateStepService");

const updateStepController = async (req, res) => {
  try {
    const result = await updateStepService(
      req.params.id,
      req.body,
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
            controller: "updateStepController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateStepController",
      success: false,
    });
  }
};

module.exports = updateStepController;
