const ServiceProvider = require("../../models/ServiceProvider");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const updateTicketTotal = require("../../utils/updateTIcketTotal");

const updateStepService = async (step_id, dataUpdate, user) => {
  try {
    
    const step = await Step.findByPk(step_id);
    if (!step) {
      return {
        code: 404,
        message: "Etapa não encontrada",
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

    const userProvider = await ServiceProvider.findByPk(ticket.provider_id);
    if (!userProvider) {
      return {
        code: 404,
        message: "Prestador de serviço não encontrado",
        success: false,
      };
    }

    // Validando se o usuário logado é o mesmo criador do ticket (prestador de serviço)
    if (userProvider.user_id !== user.id) {
      return {
        code: 403,
        message: "Apenas o prestador de serviço pode editar os detalhes da etapa.",
        success: false,
      };
    }

    // title
    // price
    // para atualizar os campos acima, o ticket e preciso estar em 'pendente'

    if (
      ticket.status !== "pendente" &&
      (dataUpdate.title !== undefined || dataUpdate.price !== undefined)
    ) {
      return {
        code: 400,
        message:
          "Só é possível alterar título ou preço se o ticket estiver pendente",
        success: false,
      };
    }

    await step.update(dataUpdate);
    await updateTicketTotal(ticket);
   
    return {
      code: 200,
      message: "Etapa atualizada com sucesso",
      step,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateStepService;
