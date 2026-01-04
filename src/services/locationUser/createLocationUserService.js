const LocationUser = require("../../models/LocationUser");
const User = require("../../models/User");

const createLocationUserService = async (data, dataUser) => {
  try {
    // user_id
    //cep
    //state
    //city
    //...

    // validar se o usuario existe
    const user = await User.findByPk(dataUser.id);
    if (!user) {
      return {
        code: 404,
        message: "User não encontrado",
        success: false,
      };
    }

    data.user_id = user.id;
    
    // criar loc
    const locationUser = await LocationUser.create(data);

    return {
      code: 201,
      message: "Localização criada com sucesso",
      success: true,
      locationUser,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createLocationUserService;
