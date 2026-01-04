const ServiceFreelancer = require("../../models/ServiceFreelancer");
const ServiceProvider = require("../../models/ServiceProvider");

const deleteServiceFreelancerService = async (id, user) => {
  try {

    // validar se o usuario e do tipo "prestador"
    if(user.type !== 'prestador'){
      return {
        code: 401,
        message: "Erro, o usuario não e do tipo 'prestador'",
        success: false,
      };
    }



    // validar se o servico existe
    const service = await ServiceFreelancer.findByPk(id);
    if (!service) {
      return {
        code: 404,
        message: "Serviço não encontrado",
        success: false,
      };
    }

    // validar se o serviço pertence ao usuario logado
    const provider = await ServiceProvider.findByPk(service.id_provider);
    if (provider.user_id !== user.id) {
      return {
        code: 400,
        message: "Acesso negado, esse serviço não pertence ao usuario logado",
        success: false,
      };
    }

    // deletar serviço
    await service.destroy();

    return {
      code: 200,
      message: "serviço deletado com sucesso",
      service,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteServiceFreelancerService;
