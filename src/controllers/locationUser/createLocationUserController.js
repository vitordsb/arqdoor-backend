const createLocationUserService = require("../../services/locationUser/createLocationUserService");

const createLocationUserController = async (req, res) => {
  try {
    const locationUser = await createLocationUserService(req.locationUser, req.user);
    return res.status(locationUser.code).json(locationUser);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "createLocationUserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createLocationUserController",
      success: false,
    });
  }
};

module.exports = createLocationUserController;
