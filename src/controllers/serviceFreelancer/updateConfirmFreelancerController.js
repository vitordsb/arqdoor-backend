const updateConfirmFreelancerService = require("../../services/step/updateConfirmFreelancerService");

const updateConfirmFreelancerController = async (req, res) => {
  try {
    const result = await updateConfirmFreelancerService(
      req.params.id,
      {
        confirm_freelancer: req.body.confirmFreelancer,
        password: req.body.password,
      },
      req.user
    );
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "updateConfirmFreelancerController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateConfirmFreelancerController",
      success: false,
    });
  }
};

module.exports = updateConfirmFreelancerController;
