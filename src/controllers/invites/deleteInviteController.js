const deleteInviteService = require("../../services/invites/deleteInviteService");

const deleteInviteController = async (req, res) => {
  try {
    const result = await deleteInviteService(req.params.id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no deleteInviteController",
      success: false,
    });
  }
};

module.exports = deleteInviteController;
