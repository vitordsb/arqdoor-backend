const addUniqueViewService = require("../../services/providers/addUniqueViewService");

const addViewProviderController = async (req, res) => {
  try {
    const provider = await addUniqueViewService(req.params.id, req.user?.id);

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
      message: "Erro no addViewProviderController",
      success: false,
    });
  }
};

module.exports = addViewProviderController;
