const UserImage = require("../../models/UserImages");
const User = require("../../models/User");
const fs = require("fs");

const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Erro ao deletar arquivo físico:", err);
  }
};

const uploadImageService = async (dataUpload) => {
  try {
    // path
    // type
    // dataUpload.id_user = user.id;

    // Se for perfil ou banner, remove os anteriores para manter apenas um atual
    if (["perfil", "banner"].includes(dataUpload.type)) {
      const existingImages = await UserImage.findAll({
        where: { user_id: dataUpload.user_id, type: dataUpload.type },
      });
      for (const img of existingImages) {
        deleteFile(img.image_path);
        await img.destroy();
      }
    }

    const userImage = await UserImage.create(dataUpload);

    // Atualiza a tabela User para manter a referência da imagem atual (perfil ou banner)
    if (dataUpload.type === "perfil") {
      await User.update(
        { perfil: dataUpload.image_path },
        { where: { id: dataUpload.user_id } }
      );
    } else if (dataUpload.type === "banner") {
      await User.update(
        { banner: dataUpload.image_path },
        { where: { id: dataUpload.user_id } }
      );
    }

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

const deleteImageService = async (userId, type) => {
  try {
    const images = await UserImage.findAll({
      where: { user_id: userId, type: type },
    });

    if (!images || images.length === 0) {
      return {
        code: 404,
        message: "Nenhuma imagem encontrada para remover.",
      };
    }

    for (const img of images) {
      deleteFile(img.image_path);
      await img.destroy();
    }

    // Remove a referência na tabela User
    if (type === "perfil") {
      await User.update({ perfil: null }, { where: { id: userId } });
    } else if (type === "banner") {
      await User.update({ banner: null }, { where: { id: userId } });
    }

    return {
      code: 200,
      message: "Imagem removida com sucesso.",
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = { uploadImageService, deleteImageService };
