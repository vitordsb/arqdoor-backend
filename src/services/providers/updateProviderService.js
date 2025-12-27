const ServiceProvider = require("../../models/ServiceProvider");

const updateProviderService = async (dataUpdate, id_provider, user) => {
  try {
    //profession
    //about

    // validar se o provider existe
    const provider = await ServiceProvider.findByPk(id_provider);
    if (!provider) {
      return {
        code: 404,
        message: "Provider não encontrado",
        success: false,
      };
    }
    // validar se o provider pertence ao usuario logado
    if (provider.user_id !== user.id) {
      return {
        code: 400,
        message:
          "Acesso negado, não é possivel atualizar um usuario que não te pertence",
      };
    }

    // atualizar provider
    await provider.update(dataUpdate);

    return {
      code: 200,
      message: "Provider atualizado com sucesso",
      provider,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateProviderService;
