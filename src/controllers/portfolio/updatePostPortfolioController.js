const updatePostPortfolioService = require("../../services/portfolio/updatePostPortfolioService");

const updatePostPortfolioController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updatePostPortfolioService(
      id,
      req.updatePortfolio,
      req.user
    );
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro no updatePostPortfolioController",
    });
  }
};

module.exports = updatePostPortfolioController;
