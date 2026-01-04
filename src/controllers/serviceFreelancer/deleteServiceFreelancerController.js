const deleteServiceFreelancerService = require("../../services/servicesFreelancerService/deleteServiceFreelancerService");

const deleteServiceFreelancerController = async (req, res) => {
  try {
    const service = await deleteServiceFreelancerService(
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
      message: "Erro no deleteServiceFreelancerController",
      success: false,
    });
  }
};

module.exports = deleteServiceFreelancerController;
