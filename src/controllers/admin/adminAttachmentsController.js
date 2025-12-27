const TicketAttachment = require("../../models/TicketAttachment");
const TicketService = require("../../models/TicketService");

const adminAttachmentsController = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await TicketService.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Ticket não encontrado",
      });
    }

    const attachments = await TicketAttachment.findAll({
      where: { ticket_id: ticketId },
      // Tabela não possui timestamps; ordenamos pela coluna `date` existente.
      order: [["date", "DESC"]],
    });

    return res.json({
      code: 200,
      success: true,
      data: attachments.map((a) => ({
        id: a.id,
        ticket_id: a.ticket_id,
        pdf_path: a.pdf_path,
        date: a.date,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro ao buscar anexos do ticket",
    });
  }
};

module.exports = adminAttachmentsController;
