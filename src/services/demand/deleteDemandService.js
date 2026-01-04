const Demand = require("../../models/Demand");

const deleteDemandService = async (id_demand, user) => {
  try {
    // ver se a demanda existe
    const demand = await Demand.findByPk(id_demand);
    if (!demand) {
      return {
        code: 404,
        message: "Demanda não encontrada",
        success: false,
      };
    }

    // validar se a demanda pertence ao usuario logado
    if (demand.id_user !== user.id) {
      return {
        code: 401,
        message: "Acesso negado, essa demanda não pertence a esse usuario",
        success: false,
      };
    }

    // proibir deletar se o status for "em andamento"
    if (demand.status === "em andamento") {
      return {
        code: 401,
        message: "Proibido deletar demanda em andamento",
        success: false,
      };
    }

    await demand.destroy();
    return {
      code: 200,
      message: "Demanda deletada com sucesso",
      demand,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = deleteDemandService;
