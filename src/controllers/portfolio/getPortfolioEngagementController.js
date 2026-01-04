const getPortfolioEngagementService = require("../../services/portfolio/getPortfolioEngagementService");

const getPortfolioEngagementController = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?.id;
    const result = await getPortfolioEngagementService(id, viewerId);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no getPortfolioEngagementController",
      success: false,
    });
  }
};

module.exports = getPortfolioEngagementController;
