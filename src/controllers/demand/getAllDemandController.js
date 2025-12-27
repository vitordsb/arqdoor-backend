const getAllDemandService = require("../../services/demand/getAllDemandService");


const getAllDemandController = async (req, res) => {
  try {
    const demands = await getAllDemandService(req.user);
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
      message: "Erro no DemandGetAllController",
      success: false,
    });
  }
};

module.exports = getAllDemandController;
