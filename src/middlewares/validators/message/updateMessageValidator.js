const updateMessageValidator = async (req, res, next) => {
  try {
    return res.status(500).json({
      code: 500,
      message: "ESSA ROTA ESTA EM DESENVOLVIMENTO",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            middleware: "createMessageValidator",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateMessageValidator",
      success: false,
    });
  }
};

module.exports = updateMessageValidator;
