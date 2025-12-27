const ServiceFreelancer = require("../../models/ServiceFreelancer");
const ServiceProvider = require("../../models/ServiceProvider");

const getAllPublicServiceFreelancerService = async () => {
  try {
    // buscar todos os servicos
    const servicesFreelancer = await ServiceFreelancer.findAll({
      include: { model: ServiceProvider },
    });

    return {
      code: 200,
      message: "Todas os servicos de freelancer",
      servicesFreelancer,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllPublicServiceFreelancerService;
