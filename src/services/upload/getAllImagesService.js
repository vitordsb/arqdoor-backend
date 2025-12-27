const User = require("../../models/User");
const UserImage = require("../../models/UserImages");

const getAllImagesService = async (query) => {
  try {
    if (query) {
      const images = await UserImage.findAll({
        where: { user_id: query },
        include: { model: User, required: true, as: "User" },
      });

      return {
        code: 200,
        message: "Todas as imagens encontradas",
        images,
        success: true,
      };
    }
    const images = await UserImage.findAll();

    return {
      code: 200,
      message: "Todas as imagens encontradas",
      images,
      success: true,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = getAllImagesService;
