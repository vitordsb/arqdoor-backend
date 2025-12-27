const { getRatings } = require("../../services/providers/providerRatingService");

const getProviderRatingsController = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?.id;
    const result = await getRatings(id, viewerId);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no getProviderRatingsController",
      success: false,
    });
  }
};

module.exports = getProviderRatingsController;
