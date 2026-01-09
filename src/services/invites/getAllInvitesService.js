const GhostInvite = require("../../models/GhostInvite");

const getAllInvitesService = async (user) => {
  try {
    const invites = await GhostInvite.findAll({
      where: { user_id: user.id },
      order: [["created_at", "DESC"]],
    });

    return {
      code: 200,
      message: "Convites carregados.",
      success: true,
      invites,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro ao buscar convites.",
      success: false,
    };
  }
};

module.exports = getAllInvitesService;
