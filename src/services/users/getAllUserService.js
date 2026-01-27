
const User = require("../../models/User");
const LocationUser = require("../../models/LocationUser");

// Ensure association is defined for the query
if (!User.associations.LocationUser) {
  User.hasOne(LocationUser, { foreignKey: "user_id" });
  LocationUser.belongsTo(User, { foreignKey: "user_id" });
}

const getAllUserService = async () => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: LocationUser,
          required: false, // Left Join (not all users might have location)
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
