const getAllInvitesService = require("../../services/invites/getAllInvitesService");

const getAllInvitesController = async (req, res) => {
  try {
    const result = await getAllInvitesService(req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no getAllInvitesController",
      success: false,
    });
  }
};

module.exports = getAllInvitesController;
