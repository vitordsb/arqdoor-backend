const updateSignatureStepService = require("../../services/step/updateSignatureStepService");

const updateSignatureStepController = async (req, res) => {
  try {
    const result = await updateSignatureStepService(
      req.params.id,
      req.signature,
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
            controller: "updateSignatureStepController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateSignatureStepController",
      success: false,
    });
  }
};

module.exports = updateSignatureStepController;
