const deleteUserService = require("../../services/users/deleteUserService");

const deleteUserController = async (req, res) => {
  try {
    const user = await deleteUserService(req.params.id);
    return res.status(user.code).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "UserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no UserGetAllController",
      success: false,
    });
  }
};

module.exports = deleteUserController;
