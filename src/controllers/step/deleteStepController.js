const deleteStepService = require("../../services/step/deleteStepService");

const deleteStepController = async (req, res) => {
  try {
    const result = await deleteStepService(req.params.id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "deleteStepController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no deleteStepController",
      success: false,
    });
  }
};

module.exports = deleteStepController;
