const User = require("../../models/User");

const deleteUserService = async (id_user) => {
  try {
    const user = await User.findByPk(id_user);
    if (!user) {
      return {
        code: 404,
        message: "Usuario não encontrado",
        success: false,
      };
    }

    // deletar usuario
    await user.destroy();

    return {
      code: 200,
      user,
      message: "Usuario deletado com sucesso",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteUserService;
