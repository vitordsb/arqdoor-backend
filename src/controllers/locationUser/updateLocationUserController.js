const updateLocationUserService = require("../../services/locationUser/updateLocationUserService");

const updateLocationUserController = async (req, res) => {
  try {
    const location = await updateLocationUserService(
      req.params.id,
      req.locationUser,
      req.user
    );

    return res.status(location.code).json(location);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "updateLocationUserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateLocationUserController",
      success: false,
    });
  }
};

module.exports = updateLocationUserController;
