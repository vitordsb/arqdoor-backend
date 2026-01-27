
const User = require("../../models/User");
const LocationUser = require("../../models/LocationUser");

const { Op } = require("sequelize");

const getAllUserService = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "arqdoor@admin.com.br";

  try {
    const users = await User.findAll({
      where: {
        email: {
          [Op.ne]: adminEmail,
        },
      },
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
