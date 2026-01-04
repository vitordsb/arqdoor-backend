const getOneLocationUserService = require("../../services/locationUser/getOneLocationUserService");

const getOneLocationUserController = async (req, res) => {
  try {
    const location = await getOneLocationUserService(req.params.id);
    return res.status(location.code).json(location);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "getOneLocationUserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getOneLocationUserController",
      success: false,
    });
  }
};

module.exports = getOneLocationUserController;
