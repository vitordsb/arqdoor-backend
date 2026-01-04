
const User = require("../../models/User");

const getAllUserService = async () => {
  try {
    const users = await User.findAll();

    return {
      code: 200,
      users,
      message: "Todos os usuarios encontrados",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllUserService;
