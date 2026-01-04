const LocationUser = require("../../models/LocationUser");
const User = require("../../models/User");

const deleteLocationUserService = async (id, dataUser) => {
  try {
    const location = await LocationUser.findByPk(id);
    if (!location) {
      return {
        code: 404,
        message: "Localização não encontrado",
        success: false,
      };
    }

    const user = await User.findByPk(dataUser.id);
    if (!user) {
      return {
        code: 404,
        message: "User não encontrado",
        success: false,
      };
    }

    // validar se a loc pertence ao user logado
    if (location.user_id !== user.id) {
      return {
        code: 409,
        message: "A localização não pertence ao usuario logado",
        success: false,
      };
    }

    // deletar localização
    await location.destroy();

    return {
      code: 200,
      message: "Localização deletada com sucesso",
      location,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteLocationUserService;
