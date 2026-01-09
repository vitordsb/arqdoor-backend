const getTicketStepsService = require("../../services/ticketService/getTicketStepsService");

const getTicketStepsController = async (req, res) => {
  const { id: ticketId } = req.params;
  const { user } = req;

  const result = await getTicketStepsService(ticketId, user);

  return res.status(result.code).json(result);
};

module.exports = getTicketStepsController;