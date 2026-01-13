const Demand = require("../../models/Demand");
const User = require("../../models/User");

const getAllDemandService = async (dataUser) => {
  try {
    // validar se o usuario existe
    const user = await User.findByPk(dataUser.id);
    if (!user) {
      return {
        code: 404,
        message: "Usuario não encontrado",
        success: false,
      };
    }

    const demand = await Demand.findAll({ where: { id_user: user.id } });

    return {
      code: 200,
      message: "Todas as demandas do usuario",
      demand,
      demands: demand,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllDemandService;
