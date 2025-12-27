const updateStatusDemandService = require("../../services/demand/updateStatusDemandService");

const updateStatusDemandController = async (req, res) => {
  try {
    // pequena validação
    if (!req.body.status) {
      return res.status(400).json({
        code: 400,
        message: "o status é obrigatorio",
      });
    }
    const demand = await updateStatusDemandService(
      req.body.status,
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
      message: "Erro no updateStatusDemandController",
      success: false,
    });
  }
};

module.exports = updateStatusDemandController;
