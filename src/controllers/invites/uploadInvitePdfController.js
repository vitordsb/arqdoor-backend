const uploadInvitePdfService = require("../../services/invites/uploadInvitePdfService");

const uploadInvitePdfController = async (req, res) => {
  try {
    const inviteId = req.params.id;
    const pdfPath = req.file ? req.file.path : "";
    const result = await uploadInvitePdfService(inviteId, pdfPath, req.user);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no uploadInvitePdfController",
      success: false,
    });
  }
};

module.exports = uploadInvitePdfController;
