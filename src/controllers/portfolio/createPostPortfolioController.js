const createPostPortfolioService = require("../../services/portfolio/createPostPortfolioService");

const createPostPortfolioController = async (req, res) => {
  try {
    const postPortfolio = await createPostPortfolioService(
      req.postPortfolio,
      req.user
    );

    return res.status(postPortfolio.code).json(postPortfolio);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "createPostPortfolioController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no createPostPortfolioController",
      success: false,
    });
  }
};

module.exports = createPostPortfolioController;
