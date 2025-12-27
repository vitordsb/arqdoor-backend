const deleteLocationUserService = require("../../services/locationUser/deleteLocationUserService");

const deleteLocationUserController = async (req, res) => {
  try {
    const location = await deleteLocationUserService(req.params.id, req.user);
    return res.status(location.code).json(location);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "deleteLocationUserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no deleteLocationUserController",
      success: false,
    });
  }
};

module.exports = deleteLocationUserController;
