
const User = require("../../models/User");

const getOneUserService = async (id_user) => {
  try {
    const user = await User.findByPk(id_user);
    if (!user) {
      return {
        code: 404,
        message: "Usuario não encontrado",
        success: true,
      };
    }

    return {
      code: 200,
      user,
      message: "User encontrado !",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getOneUserService;
