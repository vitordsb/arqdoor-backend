const createPortfolioCommentService = require("../../services/portfolio/createPortfolioCommentService");

const createPortfolioCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body || {};
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        code: 400,
        message: "Comentário é obrigatório",
        success: false,
      });
    }
    const result = await createPortfolioCommentService(id, req.user.id, comment.trim());
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no createPortfolioCommentController",
      success: false,
    });
  }
};

module.exports = createPortfolioCommentController;
