const updateInviteService = require("../../services/invites/updateInviteService");

const updateInviteController = async (req, res) => {
  try {
    const payload = req.inviteUpdate || req.body;
    const result = await updateInviteService(req.params.id, payload, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no updateInviteController",
      success: false,
    });
  }
};

module.exports = updateInviteController;
