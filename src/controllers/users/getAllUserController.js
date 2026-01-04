const getAllUserService = require("../../services/users/getAllUserService");


const getAllUserController = async (req, res) => {
  try {
    const users = await getAllUserService();
    return res.status(users.code).json(users);
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

module.exports = getAllUserController;
