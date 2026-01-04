const togglePortfolioLikeService = require("../../services/portfolio/togglePortfolioLikeService");

const togglePortfolioLikeController = async (req, res) => {
  try {
    const { id } = req.params;
    const action = req.method === "POST" ? "like" : "unlike";
    const result = await togglePortfolioLikeService(id, req.user.id, action);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no togglePortfolioLikeController",
      success: false,
    });
  }
};

module.exports = togglePortfolioLikeController;
