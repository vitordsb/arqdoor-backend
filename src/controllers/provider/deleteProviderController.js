const deleteProviderService = require("../../services/providers/deleteProviderService");

const deleteProviderController = async (req, res) => {
  try {
    // FAZER A LOGICA DE APENAS O ADM DELETAR O PROVIDER
    const provider = await deleteProviderService(req.params.id);
    return res.status(provider.code).json(provider);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "ProviderController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no ProviderDeleteController",
      success: false,
    });
  }
};

module.exports = deleteProviderController;
