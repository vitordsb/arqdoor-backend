const ServiceProvider = require("../../models/ServiceProvider");

const getAllProviderService = async () => {
  try {
    const providers = await ServiceProvider.findAll();

    return {
      code: 200,
      providers,
      message: "Todos os prestadores encontrados",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllProviderService;
