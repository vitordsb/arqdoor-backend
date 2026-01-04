const Demand = require("../../models/Demand");
const User = require("../../models/User");

const getAllPublicDemandService = async () => {
  try {
    const demand = await Demand.findAll({ include: { model: User } });

    return {
      code: 200,
      message: "Todas as demandas do usuario",
      demand,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = getAllPublicDemandService;
