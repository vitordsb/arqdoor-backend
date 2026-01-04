const getOneServiceFreelancerService = require("../../services/servicesFreelancerService/getOneServiceFreelancerService");

const getOneServiceFreelancerController = async (req, res) => {
  try {
    const serviceFreelancer = await getOneServiceFreelancerService(req.params.id);
    return res.status(serviceFreelancer.code).json(serviceFreelancer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "ServiceFreelancer",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getOneServiceFreelancerController",
      success: false,
    });
  }
};

module.exports = getOneServiceFreelancerController;
