const ServiceProvider = require("../../models/ServiceProvider");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const updateTicketTotal = require("../../utils/updateTIcketTotal");

const deleteStepService = async (step_id, user) => {
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
        message: "userProvider não encontrado",
        success: false,
      };
    }

    // Validando se o usuario logado e o mesmo criador do ticket
    if (userProvider.user_id !== user.id) {
      return {
        code: 400,
        message: "O usuario logado não e o 'dono' do ticket",
        success: false,
      };
    }

    // validar se o ticket não está em andamento
    if (ticket.status === "em andamento") {
      return {
        code: 400,
        message: "Não é possivel deletar o ticket em andamento",
        success: false,
      };
    }

    // deletar step
    await step.destroy();

    await updateTicketTotal(ticket);

    return {
      code: 200,
      message: "Etapa deletada com sucesso",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteStepService;
