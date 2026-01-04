const { upsertRating } = require("../../services/providers/providerRatingService");

const upsertProviderRatingController = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, comment } = req.body || {};
    const parsedGrade = parseInt(grade, 10);
    if (!parsedGrade || parsedGrade < 1 || parsedGrade > 5) {
      return res.status(400).json({ code: 400, message: "Nota deve ser entre 1 e 5", success: false });
    }
    const result = await upsertRating(id, req.user.id, parsedGrade, comment || null);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no upsertProviderRatingController",
      success: false,
    });
  }
};

module.exports = upsertProviderRatingController;
