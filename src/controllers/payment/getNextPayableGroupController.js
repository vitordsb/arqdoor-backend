const Step = require("../../models/Step");
const TicketService = require("../../models/TicketService");
const PaymentGroup = require("../../models/PaymentGroup");
const { Op } = require("sequelize");

/**
 * Get the next payable group for a ticket
 * Returns the first group that has unpaid steps
 */
const getNextPayableGroupController = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const user = req.user;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "ID do ticket é obrigatório",
      });
    }

    // Get ticket
    const ticket = await TicketService.findByPk(ticketId, {
      include: [{
        model: Step,
        as: "steps",
        include: [{
          model: PaymentGroup,
          as: "paymentGroup"
        }]
      }]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket não encontrado",
      });
    }

    // Check if custom mode
    const paymentPreference = (ticket.payment_preference || "at_end").toString().toLowerCase();
    if (paymentPreference !== "custom") {
      return res.status(400).json({
        success: false,
        message: "Este ticket não utiliza modo de pagamento personalizado",
      });
    }

    // Get all payment groups for this ticket
    const paymentGroups = await PaymentGroup.findAll({
      where: { ticket_id: ticketId },
      order: [['sequence', 'ASC']],
    });

    if (!paymentGroups || paymentGroups.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nenhum grupo de pagamento encontrado para este ticket",
      });
    }

    // Find first group with unpaid steps
    for (const group of paymentGroups) {
      const groupSteps = await Step.findAll({
        where: {
          ticket_id: ticketId,
          group_id: group.id
        }
      });

      if (!groupSteps || groupSteps.length === 0) continue;

      // Check if all steps are paid
      const allPaid = groupSteps.every(s => s.is_financially_cleared);
      
      if (!allPaid) {
        // This is the next payable group
        const totalAmount = groupSteps.reduce((sum, s) => sum + Number(s.price), 0);
        const paidSteps = groupSteps.filter(s => s.is_financially_cleared);

        return res.status(200).json({
          success: true,
          data: {
            group: {
              id: group.id,
              name: group.name,
              sequence: group.sequence,
              total_amount: totalAmount,
              steps_count: groupSteps.length,
              paid_steps_count: paidSteps.length,
              steps: groupSteps.map(s => ({
                id: s.id,
                title: s.title,
                price: Number(s.price),
                status: s.status,
                is_paid: s.is_financially_cleared,
                start_date: s.start_date,
                end_date: s.end_date,
              }))
            }
          }
        });
      }
    }

    // All groups are paid
    return res.status(200).json({
      success: true,
      data: {
        group: null,
        message: "Todos os grupos de pagamento foram pagos"
      }
    });

  } catch (error) {
    console.error("[getNextPayableGroupController] erro:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erro ao buscar próximo grupo pagável",
    });
  }
};

module.exports = getNextPayableGroupController;
