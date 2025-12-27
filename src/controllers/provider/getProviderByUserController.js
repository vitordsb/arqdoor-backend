const getProviderByUserService = require("../../services/providers/getProviderByUserService");

const getProviderByUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const provider = await getProviderByUserService(user_id);
    return res.status(provider.code).json(provider);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro interno ao buscar prestador",
      success: false,
    });
  }
};

module.exports = getProviderByUserController;
