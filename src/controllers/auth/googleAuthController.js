const googleAuthService = require("../../services/authService/googleAuthService");

const googleAuthController = async (req, res) => {
  try {
    const result = await googleAuthService(req.googleAuth);
    // Configuração segura do cookie (10 horas)
    if (result.data?.token) {
      res.cookie("token", result.data.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 60 * 60 * 1000,
      });
    }

    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no GoogleAuthController",
      success: false,
    });
  }
};

module.exports = googleAuthController;
