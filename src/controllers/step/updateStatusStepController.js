const updateStatusStepService = require("../../services/step/updateStatusStepService");

const updateStatusStepController = async (req, res) => {
  try {
    
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        code: 400,
        message: "O status e obrigatorio",
        success: false,
      });
    }

    const statusPermitidos = ["Pendente", "Concluido", "Recusado"];
    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: "Erro, para alterar o status, utilize os corretos",
        statusPermitidos,
        success: false,
      });
    }
    
    const result = await updateStatusStepService(
      req.params.id,
      status,
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
            controller: "updateStatusStepController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateStatusStepController",
      success: false,
    });
  }
};

module.exports = updateStatusStepController;
