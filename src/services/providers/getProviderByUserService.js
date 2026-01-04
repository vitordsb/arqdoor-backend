const ServiceProvider = require("../../models/ServiceProvider");

const getProviderByUserService = async (userId) => {
  try {
    const provider = await ServiceProvider.findOne({
      where: { user_id: userId },
    });

    if (!provider) {
      return {
        code: 404,
        message: "Prestador não encontrado para este usuário",
        success: false,
      };
    }

    return {
      code: 200,
      success: true,
      message: "Prestador encontrado",
      provider,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getProviderByUserService;
