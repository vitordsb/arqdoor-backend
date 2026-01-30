const loginUserService = require("../../services/authService/loginUserService");

const loginUserController = async (req, res) => {
  try {
    const user = await loginUserService(req.dataLogin);

    // Configuração segura do cookie (10 horas)
    if (user.data?.token) {
      res.cookie("token", user.data.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 60 * 60 * 1000, // 10 horas
      });
    }

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
