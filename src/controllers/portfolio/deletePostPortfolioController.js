const deletePostPortfolioService = require("../../services/portfolio/deletePostPortfolioService");

const deletePostPortfolioController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePostPortfolioService(id, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro no deletePostPortfolioController",
    });
  }
};

module.exports = deletePostPortfolioController;
