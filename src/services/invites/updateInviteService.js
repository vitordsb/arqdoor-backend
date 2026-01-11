const GhostInvite = require("../../models/GhostInvite");
const normalizeInviteSteps = require("./normalizeInviteSteps");

const updateInviteService = async (inviteId, data, user) => {
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

    let steps = invite.steps;
    if (data.steps !== undefined) {
      const normalized = normalizeInviteSteps(data.steps);
      if (normalized.error) {
        return {
          code: 400,
          message: normalized.error,
          success: false,
        };
      }
      steps = normalized.steps;
    }

    const nextStatus = data.status === "cancelled"
      ? "cancelled"
      : invite.contract_pdf_path && steps?.length
        ? "active"
        : "draft";

    await invite.update({
      title: data.title !== undefined ? data.title : invite.title,
      description: data.description !== undefined ? data.description : invite.description,
      payment_preference: data.payment_preference ?? invite.payment_preference ?? "at_end",
      steps,
      status: nextStatus,
    });

    return {
      code: 200,
      message: "Convite atualizado com sucesso.",
      success: true,
      invite,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro ao atualizar convite.",
      success: false,
    };
  }
};

module.exports = updateInviteService;
