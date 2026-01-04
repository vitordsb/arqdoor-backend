const User = require("../../models/User");
const UserImage = require("../../models/UserImages");

const getImagesUserService = async (id) => {
  try {
    const images = await UserImage.findAll({
      where: { user_id: id },
    //   include: { model: User, required: true, as: "User" },
    });

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

module.exports = getImagesUserService;
