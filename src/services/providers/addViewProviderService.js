const ServiceProvider = require("../../models/ServiceProvider");

const addViewProviderService = async (id) => {
  try {
    // pegar o provider desse usuario logado
    const provider = await ServiceProvider.findByPk(id);

    if (!provider) {
      return {
        code: 404,
        message: "Provider não encontrado",
        success: false,
      };
    }

    // adicionar a view
    provider.views_profile += 1;

    // atualizar no db
    await provider.save();

    return {
      code: 200,
      message: "View add com sucesso",
      provider,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = addViewProviderService;
