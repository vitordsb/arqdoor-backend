const AdditionalPayment = require("../../models/AdditionalPayment");
const TicketService = require("../../models/TicketService");
const Conversation = require("../../models/Conversation");

const listAdditionalPaymentsController = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const user = req.user;

        // Validate access
        const ticket = await TicketService.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ code: 404, message: "Ticket não encontrado", success: false });
        }

        const conversation = await Conversation.findByPk(ticket.conversation_id);
        if (!conversation) {
            return res.status(404).json({ code: 404, message: "Conversa não encontrada", success: false });
        }

        if (conversation.user1_id !== user.id && conversation.user2_id !== user.id && user.type !== 'admin') {
            return res.status(403).json({ code: 403, message: "Acesso negado", success: false });
        }

        const payments = await AdditionalPayment.findAll({
            where: { ticket_id: ticketId },
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            code: 200,
            data: payments,
            success: true
        });

    } catch (error) {
        console.error("Erro no listAdditionalPaymentsController:", error);
        return res.status(500).json({
            code: 500,
            message: "Erro interno no servidor",
            success: false,
        });
    }
};

module.exports = listAdditionalPaymentsController;
