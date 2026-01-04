const getOneProviderService = require("../../services/providers/getOneProviderService");


const getOneProviderController = async (req, res) => {
  try {
    const provider = await getOneProviderService(req.params.id_provider);
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
      message: "Erro no ProviderGetByIDController",
      success: false,
    });
  }
};

module.exports = getOneProviderController;
