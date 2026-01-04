const ServiceFreelancer = require("../../models/ServiceFreelancer");

const getOneServiceFreelancerService = async (id) => {
  try {

  


    // pegar e validar Servico
    const serviceFreelancer = await ServiceFreelancer.findByPk(id);
    if (!serviceFreelancer) {
      return {
        code: 404,
        message: "Serviço não encontrado",
        sucess: false,
      };
    }

    return {
      code: 200,
      message: "Serviço encontrado com sucesso",
      serviceFreelancer,
      sucess: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getOneServiceFreelancerService;
