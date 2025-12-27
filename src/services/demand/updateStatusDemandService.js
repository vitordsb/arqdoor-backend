const Demand = require("../../models/Demand");

const updateStatusDemandService = async (dataUpdate, id_demand, user) => {
  try {
    // validar se a demanda existe
    const demand = await Demand.findByPk(id_demand);
    if (!demand) {
      return {
        code: 404,
        message: "Demanda não encontrada",
        success: false,
      };
    }

    // validar se a demand e do usuario logado
    if (demand.id_user !== user.id) {
      return {
        code: 401,
        message: "Acesso negado, essa demanda não pertence a esse usuario",
        success: false,
      };
    }

    // validar se a dataUpdate faz parte de algum dos status
    const statusArray = ["pendente", "em andamento", "concluída", "cancelada"];

    if (!statusArray.includes(dataUpdate)) {
      return {
        code: 401,
        message: `'${dataUpdate}' não é um status correto`,
        statusCorrect: statusArray,
        success: false,
      };
    }

    await demand.update({ status: dataUpdate });

    return {
      code: 200,
      message: "Status atualizado com sucesso",
      demand,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateStatusDemandService;
