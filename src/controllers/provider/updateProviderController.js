const updateProviderService = require("../../services/providers/updateProviderService");

const updateProviderController = async (req, res) => {
  try {
    const provider = await updateProviderService(
      req.provider,
      req.params.id,
      req.user
    );

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
      message: "Erro no updateProviderController",
      success: false,
    });
  }
};

module.exports = updateProviderController;
