const { Op } = require("sequelize");
const ServiceProvider = require("../../models/ServiceProvider");
const TicketService = require("../../models/TicketService");

const getProviderActiveTicketsService = async (user) => {
  try {
    const provider = await ServiceProvider.findOne({ where: { user_id: user.id } });
    if (!provider) {
      return {
        code: 404,
        message: "Prestador não encontrado",
        success: false,
        activeTickets: [],
        hasActive: false,
      };
    }

    const activeTickets = await TicketService.findAll({
      where: {
        provider_id: provider.provider_id,
        status: {
          [Op.in]: ["pendente", "em andamento"],
        },
      },
    });

    return {
      code: 200,
      message: "Tickets ativos do prestador",
      success: true,
      activeTickets,
      hasActive: activeTickets.length > 0,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getProviderActiveTicketsService;
