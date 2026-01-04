const getAllLocationUserService = require("../../services/locationUser/getAllLocationUserService");

const getAllLocationUserController = async (req, res) => {
  try {
    const location = await getAllLocationUserService(req.query.user_id);
    return res.status(location.code).json(location);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "getAllLocationUserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllLocationUserController",
      success: false,
    });
  }
};

module.exports = getAllLocationUserController;
