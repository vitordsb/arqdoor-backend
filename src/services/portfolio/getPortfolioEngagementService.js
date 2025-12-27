const Portfolio = require("../../models/Portfolio");
const PortfolioLike = require("../../models/PortfolioLike");
const PortfolioComment = require("../../models/PortfolioComment");
const User = require("../../models/User");

const getPortfolioEngagementService = async (portfolioId, viewerId) => {
  const portfolio = await Portfolio.findByPk(portfolioId);
  if (!portfolio) {
    return { code: 404, message: "Portfólio não encontrado", success: false };
  }

  const [likesCount, comments, liked] = await Promise.all([
    PortfolioLike.count({ where: { portfolio_id: portfolioId } }),
    PortfolioComment.findAll({
      where: { portfolio_id: portfolioId },
      include: [{ model: User, as: "User", attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    }),
    viewerId
      ? PortfolioLike.findOne({ where: { portfolio_id: portfolioId, user_id: viewerId } })
      : null,
  ]);

  return {
    code: 200,
    success: true,
    likes: likesCount,
    liked: !!liked,
    comments: comments.map((c) => {
      const plain = c.toJSON();
      return {
        id: plain.id,
        comment: plain.comment,
        createdAt: plain.createdAt,
        user: plain.User ? { id: plain.User.id, name: plain.User.name } : null,
      };
    }),
  };
};

module.exports = getPortfolioEngagementService;
