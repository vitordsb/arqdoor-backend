const createDemandService = require("../../services/demand/createDemandService");


const createDemandController = async (req, res) => {
  try {
    const demand = await createDemandService(req.user, req.demand);

    return res.status(demand.code).json(demand);
  } catch (error) {
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
      message: "Erro no DemandCreateController",
      success: false,
    });
  }
};

module.exports = createDemandController;
