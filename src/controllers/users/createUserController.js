const createUserService = require("../../services/users/createUserService");

const createUserController = async (req, res) => {
  try {
    const user = await createUserService(req.user);

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
      message: "Erro no UserCreateController",
      success: false,
    });
  }
};

module.exports = createUserController;
