const ServiceProvider = require("../../models/ServiceProvider");

const deleteProviderService = async (id_provider, user) => {
  try {
    const provider = await ServiceProvider.findByPk(id_provider);
    if (!provider) {
      return {
        code: 404,
        message: "Prestador não encontrado",
        success: false,
      };
    }

    
    await provider.destroy();
    return {
      code: 200,
      message: "Prestador deletado",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteProviderService;
