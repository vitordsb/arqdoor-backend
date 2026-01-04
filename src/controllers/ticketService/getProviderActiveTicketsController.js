const getProviderActiveTicketsService = require("../../services/ticketService/getProviderActiveTicketsService");

const getProviderActiveTicketsController = async (req, res) => {
  try {
    const result = await getProviderActiveTicketsService(req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no getProviderActiveTicketsController",
      success: false,
      error: {
        details: [
          {
            controller: "getProviderActiveTicketsController",
            message: error.message || "Erro interno",
          },
        ],
      },
    });
  }
};

module.exports = getProviderActiveTicketsController;
