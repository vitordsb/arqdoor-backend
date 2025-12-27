const updateServiceFreelancerService = require("../../services/servicesFreelancerService/updateServiceFreelancerService");

const updateServiceFreelancerController = async (req, res) => {
  try {
    const service = await updateServiceFreelancerService(
      req.serviceFreelancer,
      req.params.id,
      req.user
    );

    return res.status(service.code).json(service);
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
      message: "Erro no updateServiceFreelancerController",
      success: false,
    });
  }
};

module.exports = updateServiceFreelancerController;
