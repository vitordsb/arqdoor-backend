const createInviteService = require("../../services/invites/createInviteService");

const createInviteController = async (req, res) => {
  try {
    const result = await createInviteService(req.invite || req.body, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no createInviteController",
      success: false,
    });
  }
};

module.exports = createInviteController;
