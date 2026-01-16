const path = require("path");
const uploadInvitePdfService = require("../../services/invites/uploadInvitePdfService");

const normalizePdfPath = (filePath) => {
  if (!filePath) return "";
  const normalized = filePath.split(path.sep).join("/");
  const marker = "/uploads/";
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return normalized;
  return normalized.slice(idx + 1);
};

const uploadInvitePdfController = async (req, res) => {
  try {
    const inviteId = req.params.id;
    const pdfPath = req.file ? normalizePdfPath(req.file.path) : "";
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
