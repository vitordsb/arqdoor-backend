const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");

const getTicketPaymentGroupsService = async (ticketId) => {
  try {
    const ticket = await TicketService.findByPk(ticketId);
    if (!ticket) {
      return { code: 404, success: false, message: "Ticket não encontrado." };
    }

    const steps = await Step.findAll({
      where: { ticket_id: ticketId },
      order: [["id", "ASC"]],
    });

    const groupsMap = {};
    const looseSteps = [];

    steps.forEach((step) => {
      if (step.group_id) {
        if (!groupsMap[step.group_id]) {
          groupsMap[step.group_id] = {
            group_id: step.group_id,
            steps: [],
            total_price: 0,
            is_fully_paid: true,
          };
        }
        groupsMap[step.group_id].steps.push(step);
        groupsMap[step.group_id].total_price += Number(step.price);
        if (!step.is_financially_cleared) {
          groupsMap[step.group_id].is_fully_paid = false;
        }
      } else {
        looseSteps.push(step);
      }
    });

    return {
      code: 200,
      success: true,
      data: {
        groups: Object.values(groupsMap),
        loose_steps: looseSteps,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getTicketPaymentGroupsService;