const Portfolio = require("../../models/Portfolio");
const UserImage = require("../../models/UserImages");

const updatePostPortfolioService = async (portfolioId, data, user) => {
  try {
    const portfolio = await Portfolio.findByPk(portfolioId);
    if (!portfolio) {
      return { code: 404, message: "Destaque não encontrado", success: false };
    }

    if (portfolio.user_id !== user.id) {
      return {
        code: 403,
        message: "Você não pode editar este destaque",
        success: false,
      };
    }

    const payload = {};

    if (data.title !== undefined) {
      payload.title = data.title;
    }

    if (data.description !== undefined) {
      payload.description = data.description;
    }

    if (data.image_id) {
      const image = await UserImage.findByPk(data.image_id);
      if (!image) {
        return {
          code: 404,
          message: "A nova imagem não foi encontrada",
          success: false,
        };
      }
      if (image.user_id !== user.id) {
        return {
          code: 400,
          message: "A nova imagem precisa pertencer ao usuário",
          success: false,
        };
      }
      payload.image_id = data.image_id;
    }

    if (Object.keys(payload).length === 0) {
      return {
        code: 400,
        message: "Nada para atualizar",
        success: false,
      };
    }

    await portfolio.update(payload);

    return {
      code: 200,
      message: "Destaque atualizado com sucesso",
      success: true,
      portfolio,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updatePostPortfolioService;
