const getInvitePublicService = require("../../services/invites/getInvitePublicService");

const getInvitePublicController = async (req, res) => {
  try {
    const result = await getInvitePublicService(req.params.token);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no getInvitePublicController",
      success: false,
    });
  }
};

module.exports = getInvitePublicController;
