const createStepService = require("../../services/step/createStepService");

const createStepController = async (req, res) => {
  try {
    console.log("ESSE LOG E NO CREATESTEPCONTROLLER", req.step);

    const step = await createStepService(req.step, req.user);
    return res.status(step.code).json(step);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "createStepController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createStepController",
      success: false,
    });
  }
};

module.exports = createStepController;
