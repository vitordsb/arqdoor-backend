const Portfolio = require("../../models/Portfolio");
const PortfolioComment = require("../../models/PortfolioComment");
const User = require("../../models/User");

const createPortfolioCommentService = async (portfolioId, userId, text) => {
  const portfolio = await Portfolio.findByPk(portfolioId);
  if (!portfolio) {
    return { code: 404, message: "Portfólio não encontrado", success: false };
  }

  const comment = await PortfolioComment.create({
    portfolio_id: portfolioId,
    user_id: userId,
    comment: text,
  });

  const user = await User.findByPk(userId);

  return {
    code: 200,
    success: true,
    comment: {
      ...comment.toJSON(),
      User: user ? { id: user.id, name: user.name, avatar: user.avatar } : undefined,
    },
  };
};

module.exports = createPortfolioCommentService;
