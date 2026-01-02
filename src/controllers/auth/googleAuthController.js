const googleAuthService = require("../../services/authService/googleAuthService");

const googleAuthController = async (req, res) => {
  try {
    const result = await googleAuthService(req.googleAuth);
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
