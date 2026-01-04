const getAllPublicServiceFreelancerService = require("../../services/servicesFreelancerService/getAllPublicServiceFreelancerService");

const getAllPublicServiceFreelancerController = async (req, res) => {
  // console.log("testea");

  try {
    const servicesFreelancer = await getAllPublicServiceFreelancerService();

    return res.status(servicesFreelancer.code).json(servicesFreelancer);
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
      message: "Erro no getAllPublicServiceFreelancerController",
      success: false,
    });
  }
};

module.exports = getAllPublicServiceFreelancerController;
