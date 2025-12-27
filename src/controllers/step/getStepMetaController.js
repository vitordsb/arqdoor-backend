const getStepMetaService = require("../../services/step/getStepMetaService");

const getStepMetaController = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getStepMetaService(id, req.user);

    return res.status(response.code).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro ao buscar meta da etapa",
      success: false,
    });
  }
};

module.exports = getStepMetaController;
