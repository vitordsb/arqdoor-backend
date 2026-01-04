const getAllProviderService = require("../../services/providers/getAllProviderService");


const getAllProviderController = async (req, res) => {
  try {
    const providers = await getAllProviderService();

    return res.status(providers.code).json(providers);
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
      message: "Erro no ProviderGetAllController",
      success: false,
    });
  }
};

module.exports = getAllProviderController;
