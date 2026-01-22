const ServiceProvider = require("../../models/ServiceProvider");
const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const updateTicketTotal = require("../../utils/updateTIcketTotal");
const dayjs = require("dayjs");

const createStepService = async (dataStep, user) => {
  try {
    // step
    // validar se o ticket existe

    const ticket = await TicketService.findByPk(dataStep.ticket_id);
    if (!ticket) {
      return {
        code: 404,
        message: "Ticket não encontrado",
        success: false,
      };
    }

    const userProvider = await ServiceProvider.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!userProvider) {
      return {
        code: 404,
        message: "User provider não encontrado",
        success: false,
      };
    }

    // validar se quem ta criando o step e o 'dono' do ticket
    if (ticket.provider_id !== userProvider.provider_id) {
      return {
        code: 400,
        message: "Apenas o dono do ticket consegue criar uma etapa",
        success: false,
      };
    }

    // validar se o ticket está pendente
    if (ticket.status !== "pendente") {
      return {
        code: 400,
        message: "Só e possivel criar uma etapa sé o ticket estiver pendente",
        success: false,
      };
    }

    if (dataStep.groupId !== undefined) {
      dataStep.group_id = dataStep.groupId;
    }

    const step = await Step.create(dataStep);

    // atualizar o total_price e o total_date do ticket
    await updateTicketTotal(ticket);

    return {
      code: 201,
      message: "Etapa criada com sucesso",
      success: true,
      step,
    };
  } catch (error) {
    console.error("Erro ao criar step:", error);
    return {
      code: 500,
      message: error?.message || "Erro interno ao salvar a etapa",
      success: false,
      error: {
        details: [{ message: error?.message }],
      },
    };
  }
};

module.exports = createStepService;
