const ServiceProvider = require("../../models/ServiceProvider");

const getOneProviderService = async (provider_id) => {
  try {
    const provider = await ServiceProvider.findByPk(provider_id);
    if (!provider) {
      return {
        code: 404,
        message: "Prestador não encontrado",
        success: false,
      };
    }

    return {
      code: 200,
      provider,
      message: "Prestador encontrado !",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getOneProviderService;
