const createProviderService = require("../../services/providers/createProviderService");


const createProviderController = async (req, res) => {
  try {
    const provider = await createProviderService(req.provider);

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
      message: "Erro no ProviderCreateController",
      success: false,
    });
  }
};

module.exports = createProviderController;
