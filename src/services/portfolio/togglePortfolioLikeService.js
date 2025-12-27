const Portfolio = require("../../models/Portfolio");
const PortfolioLike = require("../../models/PortfolioLike");

const togglePortfolioLikeService = async (portfolioId, userId, action) => {
  const portfolio = await Portfolio.findByPk(portfolioId);
  if (!portfolio) {
    return { code: 404, message: "Portfólio não encontrado", success: false };
  }

  if (action === "like") {
    const [like] = await PortfolioLike.findOrCreate({
      where: { portfolio_id: portfolioId, user_id: userId },
      defaults: { portfolio_id: portfolioId, user_id: userId },
    });
    return { code: 200, success: true, liked: true, like };
  }

  await PortfolioLike.destroy({ where: { portfolio_id: portfolioId, user_id: userId } });
  return { code: 200, success: true, liked: false };
};

module.exports = togglePortfolioLikeService;
