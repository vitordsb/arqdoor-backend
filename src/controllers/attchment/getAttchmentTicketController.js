const getAttchmentTicketService = require("../../services/attchment/getAttchmentTicketService");

const getAttchmentTicketController = async (req, res) => {
  try {
    const result = await getAttchmentTicketService(req.params.id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getAttchmentTicketController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAttchmentTicketController",
      success: false,
    });
  }
};

module.exports = getAttchmentTicketController;
