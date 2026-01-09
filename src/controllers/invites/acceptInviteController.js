const acceptInviteService = require("../../services/invites/acceptInviteService");

const acceptInviteController = async (req, res) => {
  try {
    const result = await acceptInviteService(req.params.token, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no acceptInviteController",
      success: false,
    });
  }
};

module.exports = acceptInviteController;
