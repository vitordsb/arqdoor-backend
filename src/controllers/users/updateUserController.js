const updateUserService = require("../../services/users/updateUserService");

const updateUserController = async (req, res) => {
  try {
    const user = await updateUserService(req.user, req.params.id);

    return res.status(user.code).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "user",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateUserController",
      success: false,
    });
  }
};

module.exports = updateUserController;
