const Conversation = require("../../models/Conversation");
const ServiceProvider = require("../../models/ServiceProvider");
const TicketAttchment = require("../../models/TicketAttachment");
const TicketService = require("../../models/TicketService");

const uploadPdfService = async (dataUpload, user) => {
  try {
    // validar se existe o ticket
    const ticket = await TicketService.findByPk(dataUpload.ticket_id);
  
    
    if (!ticket) {
      return {
        code: 400,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    // validar se o usuario logado e o 'dono' do ticket
    const userProvider = await ServiceProvider.findByPk(ticket.provider_id);
    if (!userProvider) {
      return {
        code: 400,
        message: "O usuario provider não foi encontrado",
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

    // validar se o user logado faz parte do ticket
    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 400,
        message: "O usuario logado não faz parte dessa negociação",
        success: false,
      };
    }

    // // validar se já não exist eum arquivo anexado
    // const arquivos = await TicketAttchment.findAll({
    //   where: { ticket_id: ticket.id },
    // });

    // if (arquivos.length > 1) {
    //   return {
    //     code: 400,
    //     message: "Já tem um contrato anexado",
    //     success: false,
    //   };
    // }

    // Se o dataUpload tiver o caminho do pdf, o pdf já foi criado, então, so criar no db
    if (dataUpload.pdf_path) {
      const pdf = await TicketAttchment.create(dataUpload);
      return {
        code: 201,
        message: "upload feito com sucesso",
        pdf,
      };
    }

    return;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = uploadPdfService;
