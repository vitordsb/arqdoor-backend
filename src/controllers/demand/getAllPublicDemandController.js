const getAllPublicDemandService = require("../../services/demand/getAllPublicDemandService");

const getAllPublicDemandController = async (req, res) => {
  try {
    const demands = await getAllPublicDemandService();
    return res.status(demands.code).json(demands);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "DemandController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllPublicDemandController",
      success: false,
    });
  }
};

module.exports = getAllPublicDemandController;
