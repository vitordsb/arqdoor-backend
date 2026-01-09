const getInviteByIdService = require("../../services/invites/getInviteByIdService");

const getInviteByIdController = async (req, res) => {
  try {
    const result = await getInviteByIdService(req.params.id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no getInviteByIdController",
      success: false,
    });
  }
};

module.exports = getInviteByIdController;
