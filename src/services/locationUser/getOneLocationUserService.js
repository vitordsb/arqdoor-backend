const LocationUser = require("../../models/LocationUser");

const getOneLocationUserService = async (id) => {
  try {
    const location = await LocationUser.findByPk(id);
    if (!location) {
      return {
        code: 404,
        message: "Localização não encontrada",
        success: false,
      };
    }

    return {
      code: 200,
      message: "Localização encontrada",
      location,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getOneLocationUserService;
