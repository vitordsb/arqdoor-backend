const updateDemandService = require("../../services/demand/updateDemandService");

const updateDemandController = async (req, res) => {
  try {
    const demand = await updateDemandService(
      req.demand,
      req.params.id,
      req.user
    );
    return res.status(demand.code).json(demand);
  } catch (error) {
    console.error(error);
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
      message: "Erro no updateDemandController",
      success: false,
    });
  }
};

module.exports = updateDemandController;
