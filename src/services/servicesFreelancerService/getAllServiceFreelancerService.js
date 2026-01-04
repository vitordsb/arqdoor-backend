const ServiceFreelancer = require("../../models/ServiceFreelancer");
const ServiceProvider = require("../../models/ServiceProvider");

const getAllServiceFreelancerService = async (user) => {
  try {

    // validar se o usuario e do tipo "prestador"
    if(user.type !== 'prestador'){
      return {
        code: 401,
        message: "Erro, o usuario não e do tipo 'prestador'",
        success: false,
      };
    }

    // puxar o id do usuario na tabela ServiceProvider
    const userProvider = await ServiceProvider.findOne({
      where: { user_id: user.id },
    });

    // Validar se não achar o usuario
    if (!userProvider) {
      return {
        code: 404,
        error: {
          details: [
            {
              field: "user_id",
              message: "O usuario não foi encontrado",
            },
          ],
        },
        message: "Erro ao encontrar usuario",
        success: false,
      };
    }

    // buscar todos os servicos
    const servicesFreelancer = await ServiceFreelancer.findAll({
      where: { id_provider: userProvider.provider_id },
    });

    return {
      code: 200,
      message: "Todas os servicos do freelancer",
      servicesFreelancer,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllServiceFreelancerService;
