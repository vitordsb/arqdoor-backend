const deleteDemandService = require("../../services/demand/deleteDemandService");

const deleteDemandController = async (req, res, next) => {
  try {
    const demand = await deleteDemandService(req.params.id, req.user);
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
      message: "Erro no deleteDemandController",
      success: false,
    });
  }
};

module.exports = deleteDemandController;
