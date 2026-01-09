const GhostInvite = require("../../models/GhostInvite");

const getInviteByIdService = async (inviteId, user) => {
  try {
    const invite = await GhostInvite.findByPk(inviteId);
    if (!invite) {
      return {
        code: 404,
        message: "Convite não encontrado.",
        success: false,
      };
    }

    if (invite.user_id !== user.id) {
      return {
        code: 403,
        message: "Sem permissão para acessar este convite.",
        success: false,
      };
    }

    return {
      code: 200,
      message: "Convite carregado.",
      success: true,
      invite,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro ao buscar convite.",
      success: false,
    };
  }
};

module.exports = getInviteByIdService;
