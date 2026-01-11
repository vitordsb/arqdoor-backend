const Conversation = require("../../models/Conversation");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const updateSignatureStepService = async (step_id, dataUpdate, user) => {
  try {
    // Buscando o step
    const step = await Step.findByPk(step_id);
    if (!step) {
      return {
        code: 404,
        message: "Step não encontrado",
        success: false,
      };
    }

    const ticket = await TicketService.findByPk(step.ticket_id);
    if (!ticket) {
      return {
        code: 404,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    // validar se conversation existe
    const conversation = await Conversation.findByPk(ticket.conversation_id);
    if (!conversation) {
      return {
        code: 404,
        message: "Conversa não encontrada",
        success: false,
      };
    }

    // validar se o user logado faz parte da conversa
    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 400,
        message: "O usuario logado não está nessa conversa",
        success: false,
      };
    }

    // validar se a senha enviada coincide com a senha do contratante
    if (user.type !== "contratante") {
      return {
        code: 400,
        message:
          "Apenas o usuario que está contratando o serviço pode assinar o ticket",
        success: false,
      };
    }

    const userLogado = await User.findByPk(user.id);
    if (!userLogado) {
      return {
        code: 404,
        message: "Usuario não encontrado",
        success: false,
      };
    }

    const signatureReady =
      userLogado.signature_password_set === true && !!userLogado.password;
    if (!signatureReady) {
      return {
        code: 400,
        message: "Você não configurou sua senha de assinatura.",
        success: false,
      };
    }

    const trimmedPassword = (dataUpdate.password || "").trim();
    if (!trimmedPassword) {
      return {
        code: 400,
        message: "Senha de assinatura obrigatória.",
        success: false,
      };
    }

    if (!bcrypt.compareSync(trimmedPassword, userLogado.password)) {
      return {
        code: 400,
        message: "Senha incorreta",
        success: false,
      };
    }

    // atualizar a assinatura e confirmar o lado do contratante
    const shouldConclude = !!step.confirm_freelancer || step.status?.toLowerCase() === "concluido";
    await step.update({
      signature: dataUpdate.signature,
      confirm_contractor: true,
      status: shouldConclude ? "Concluido" : step.status,
    });

    // Se ambas as partes confirmaram, verifica se todas etapas estão concluídas para fechar o ticket
    try {
      const steps = await Step.findAll({ where: { ticket_id: ticket.id } });
      const allConcluded =
        steps.length > 0 &&
        steps.every(
          (s) =>
            (s.status || "").toLowerCase() === "concluido" ||
            (s.confirm_freelancer && s.confirm_contractor)
        );
      if (allConcluded) {
        await TicketService.update({ status: "concluída" }, { where: { id: ticket.id } });
      }
    } catch (e) {
      console.warn("Falha ao avaliar conclusão do ticket após assinatura de etapa", e);
    }

    return {
      code: 200,
      message: "Assinatura atualizada com sucesso",
      success: true,
      step,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateSignatureStepService;
