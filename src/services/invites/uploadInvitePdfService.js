const GhostInvite = require("../../models/GhostInvite");

const uploadInvitePdfService = async (inviteId, pdfPath, user) => {
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
        message: "Sem permissão para atualizar este convite.",
        success: false,
      };
    }

    if (invite.status === "accepted") {
      return {
        code: 400,
        message: "Convite já aceito e não pode ser alterado.",
        success: false,
      };
    }

    if (!pdfPath) {
      return {
        code: 400,
        message: "Arquivo PDF não encontrado.",
        success: false,
      };
    }

    const status = invite.steps?.length ? "active" : "draft";

    await invite.update({
      contract_pdf_path: pdfPath,
      status,
    });

    return {
      code: 200,
      message: "PDF anexado ao convite.",
      success: true,
      invite,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro ao anexar PDF.",
      success: false,
    };
  }
};

module.exports = uploadInvitePdfService;
