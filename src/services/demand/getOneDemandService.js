const Demand = require("../../models/Demand");

const getOneDemandService = async (demand_id, dataUser) => {
  try {
    const demand = await Demand.findByPk(demand_id);
    if (!demand) {
      return {
        code: 404,
        message: "Demanda não encontrada",
        success: false,
      };
    }
    return {
      code: 200,
      demand,
      success: true,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = getOneDemandService;
