const { deleteRating } = require("../../services/providers/providerRatingService");

const deleteProviderRatingController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteRating(id, req.user.id);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no deleteProviderRatingController",
      success: false,
    });
  }
};

module.exports = deleteProviderRatingController;
