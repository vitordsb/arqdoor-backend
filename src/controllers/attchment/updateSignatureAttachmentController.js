const updateSignatureAttachmentService = require("../../services/attchment/updateSignatureAttachmentService");

const updateSignatureAttachmentController = async (req, res) => {
  try {
    const result = await updateSignatureAttachmentService(
      req.params.id,
      req.signature,
      req.user
    );
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "updateSignatureAttachmentController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no updateSignatureAttachmentController",
      success: false,
    });
  }
};

module.exports = updateSignatureAttachmentController;
