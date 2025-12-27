const LocationUser = require("../../models/LocationUser");
const User = require("../../models/User");

const updateLocationUserService = async (id, data, dataUser) => {
  try {
    // validar loc
    const location = await LocationUser.findByPk(id);
    if (!location) {
      return {
        code: 404,
        message: "Localização não encontrada",
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

    // Validar se o user logado e 'dono' da localização
    if (location.user_id !== user.id) {
      return {
        code: 409,
        message: "O usuario logado não e responsavel pela localização",
        success: false,
      };
    }

    // atualizar
    await location.update(data);

    return {
      code: 200,
      message: "Localização atualizada com sucesso",
      location,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateLocationUserService;
