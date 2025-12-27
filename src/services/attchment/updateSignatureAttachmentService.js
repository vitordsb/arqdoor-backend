const Conversation = require("../../models/Conversation");
const TicketAttchment = require("../../models/TicketAttachment");
const TicketService = require("../../models/TicketService");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const updateSignatureAttachmentService = async (
  ticket_id,
  dataUpdate,
  user
) => {
  try {
    const ticket = await TicketService.findByPk(ticket_id);
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

    if (!bcrypt.compareSync(dataUpdate.password, userLogado.password)) {
      return {
        code: 400,
        message: "Senha incorreta",
        success: false,
      };
    }

    const contrato = await TicketAttchment.findOne({
      where: { ticket_id: ticket.id },
    });


    if (!contrato) {
      return {
        code: 404,
        message: "Contrato não encontrado",
        success: false,
      };
    }
    await contrato.update({ signature: dataUpdate.signature });

    return {
      code: 200,
      message: "Assinatura atualizada com sucesso",
      contrato,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateSignatureAttachmentService;
