const PaymentGroup = require("../../models/PaymentGroup");
const TicketService = require("../../models/TicketService");

const createPaymentGroupService = async (data) => {
  try {
    console.log("Dados recebidos no service de grupo:", data);
    const { ticket_id, name, sequence } = data;

    if (!ticket_id) {
      return { code: 400, success: false, message: "Ticket ID é obrigatório." };
    }

    const ticket = await TicketService.findByPk(ticket_id);
    if (!ticket) {
      return { code: 404, success: false, message: "Ticket não encontrado." };
    }

    const paymentGroup = await PaymentGroup.create({
      ticket_id: Number(ticket_id),
      name,
      sequence,
    });

    return {
      code: 201,
      success: true,
      message: "Grupo de pagamento criado com sucesso.",
      data: paymentGroup,
    };
  } catch (error) {
    console.error("Erro ao criar grupo de pagamento:", error);
    throw new Error(error.message);
  }
};

module.exports = createPaymentGroupService;
