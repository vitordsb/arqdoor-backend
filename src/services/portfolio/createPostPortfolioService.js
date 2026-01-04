const Portfolio = require("../../models/Portfolio");
const UserImage = require("../../models/UserImages");

const createPostPortfolioService = async (data, user) => {
  try {
    // validar se essa imagem exist
    console.log(data);

    const image = await UserImage.findByPk(data.image_id);
    if (!image) {
      return {
        code: 404,
        message: "A imagem não foi encontrada",
        success: false,
      };
    }

    // validar se o user um prestador
    if (user.type !== "prestador") {
      return {
        code: 401,
        message: "Erro, o usuario não e do tipo 'prestador'",
        success: false,
      };
    }

    // validar se a imagem pertence ao usuario
    if (image.user_id !== user.id) {
      return {
        code: 400,
        message: "A imagem não pertence ao usuario logado",
        success: false,
      };
    }

    data.user_id = user.id;

    const postPortfolio = await Portfolio.create(data);
    return {
      code: 200,
      message: "Post no portfolio criado com sucesso",
      postPortfolio,
      success: true,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = createPostPortfolioService;
