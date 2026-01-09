const GhostInvite = require("../../models/GhostInvite");

const deleteInviteService = async (inviteId, user) => {
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
        message: "Sem permissão para remover este convite.",
        success: false,
      };
    }

    if (invite.status === "accepted") {
      return {
        code: 400,
        message: "Convite já aceito e não pode ser removido.",
        success: false,
      };
    }

    await invite.destroy();

    return {
      code: 200,
      message: "Convite removido com sucesso.",
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro ao remover convite.",
      success: false,
    };
  }
};

module.exports = deleteInviteService;
