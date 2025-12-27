const registerUserService = require("../../services/authService/registerUserService");


const registerUserController = async (req, res) => {
  try {
    const user = await registerUserService(req.user);
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
      message: "Erro no RegisterUserController",
      success: false,
    });
  }
};

module.exports = registerUserController;
