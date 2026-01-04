const Portfolio = require("../../models/Portfolio");
const PortfolioLike = require("../../models/PortfolioLike");
const PortfolioComment = require("../../models/PortfolioComment");
const sequelize = require("../../database/config");

const deletePostPortfolioService = async (portfolioId, user) => {
  try {
    const transaction = await sequelize.transaction();
    try {
      const portfolio = await Portfolio.findByPk(portfolioId, { transaction });
      if (!portfolio) {
        await transaction.rollback();
        return { code: 404, message: "Destaque não encontrado", success: false };
      }

      if (portfolio.user_id !== user.id) {
        await transaction.rollback();
        return {
          code: 403,
          message: "Você não pode excluir este destaque",
          success: false,
        };
      }

      // Remove likes e comentários para evitar violação de FK
      await PortfolioLike.destroy({ where: { portfolio_id: portfolioId }, transaction });
      await PortfolioComment.destroy({ where: { portfolio_id: portfolioId }, transaction });

      await portfolio.destroy({ transaction });
      await transaction.commit();

      return {
        code: 200,
        message: "Destaque removido com sucesso",
        success: true,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deletePostPortfolioService;
