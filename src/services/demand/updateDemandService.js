const Demand = require("../../models/Demand");

const updateDemandService = async (dataDemand, id_demand, user) => {
  try {
    //title
    //description
    //price

    // validar se a demanda existe
    const demand = await Demand.findByPk(id_demand);
    if (!demand) {
      return {
        code: 404,
        message: "Demanda não encontrada",
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

    // validar se a demand e do usuario logado
    if (demand.id_user !== user.id) {
      return {
        code: 403,
        message: "Acesso negado, essa demanda não pertence a esse usuario",
        success: false,
      };
    }
    await demand.update(dataDemand);

    return {
      code: 200,
      message: "Demanda atualizada com sucesso",
      demand,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateDemandService;
