const LocationUser = require("../../models/LocationUser");

const getAllLocationUserService = async (query) => {
  try {
    if (query) {
      const locations = await LocationUser.findAll({
        where: {
          user_id: query,
        },
      });
      return {
        code: 200,
        message: "Todas as localizações",
        locations,
        success: true,
      };
    }
    const locations = await LocationUser.findAll();
    return {
      code: 200,
      message: "Todas as localizações",
      locations,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllLocationUserService;
