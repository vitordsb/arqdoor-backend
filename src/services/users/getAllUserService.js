
const User = require("../../models/User");
const LocationUser = require("../../models/LocationUser");

const getAllUserService = async () => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: LocationUser,
          as: 'LocationUser', // Must match alias in associations.js
          required: false, 
        },
      ],
    });

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
