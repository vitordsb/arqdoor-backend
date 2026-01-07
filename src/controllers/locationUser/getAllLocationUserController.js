const getAllLocationUserService = require("../../services/locationUser/getAllLocationUserService");

const getAllLocationUserController = async (req, res) => {
  try {
    const requestedUserId = req.query.user_id;
    const tokenUserId = req.user?.id;

    if (requestedUserId && Number(requestedUserId) !== Number(tokenUserId)) {
      return res.status(403).json({
        code: 403,
        message: "Acesso negado",
        success: false,
      });
    }

    const targetUserId = requestedUserId || tokenUserId;
    const location = await getAllLocationUserService(targetUserId);
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
