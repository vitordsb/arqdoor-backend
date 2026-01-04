const Demand = require("../../models/Demand");
const User = require("../../models/User");

const createDemandService = async (dataUser, dataDemand) => {
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
    // validar se o usuario e do tipo contratante
    if (user.type !== "contratante") {
      return {
        code: 403,
        message: "Apenas usuarios contratantes podem criar uma demanda",
        success: false,
      };
    }

    // Criar demanda
    dataDemand.id_user = user.id;
    const demand = await Demand.create(dataDemand);

    return {
      code: 201,
      demand,
      message: "Demanda criada com sucesso",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createDemandService;
