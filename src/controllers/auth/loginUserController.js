const loginUserService = require("../../services/authService/loginUserService");

const loginUserController = async (req, res) => {
  try {
    const user = await loginUserService(req.dataLogin);

    return res.status(user.code).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "AuthController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no LoginUserController",
      success: false,
    });
  }
};

module.exports = loginUserController;
