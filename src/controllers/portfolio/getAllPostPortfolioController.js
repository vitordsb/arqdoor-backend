const getAllPostPortfolioService = require("../../services/portfolio/getAllPostPortofolioService");

const getAllPostPortfolioController = async (req, res) => {
  try {
    const posts = await getAllPostPortfolioService(req.query.user);
    return res.status(posts.code).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getAllPostPortfolioController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllPostPortfolioController",
      success: false,
    });
  }
};

module.exports = getAllPostPortfolioController;
