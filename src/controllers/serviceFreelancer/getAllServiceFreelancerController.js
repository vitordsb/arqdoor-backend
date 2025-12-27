const GetAllServiceFreelancerService = require("../../services/servicesFreelancerService/getAllServiceFreelancerService");

const getAllServiceFreelancerController = async (req, res) => {
  // console.log("testea");

  try {
    const servicesFreelancer = await GetAllServiceFreelancerService(req.user);

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
      message: "Erro no ServiceFreelancer",
      success: false,
    });
  }
};

module.exports = getAllServiceFreelancerController;
