const UserImage = require("../../models/UserImages");

const uploadImageService = async (dataUpload) => {
  try {
    // path
    // type
    // dataUpload.id_user = user.id;
    const userImage = await UserImage.create(dataUpload);
    return {
      code: 200,
      message: "upload feito com sucesso",
      userImage,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = uploadImageService;
