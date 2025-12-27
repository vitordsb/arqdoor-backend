const CreateServiceFreelancerService = require("../../services/servicesFreelancerService/createServiceFreelancerService");

const createServiceFreelancerController = async (req, res) => {
  try {
    const serviceFreelancer = await CreateServiceFreelancerService(
      req.user,
      req.serviceFreelancer
    );
    console.log(req.user);

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
      message: "Erro no ServiceFreelancer",
      success: false,
    });
  }
};

module.exports = createServiceFreelancerController;
