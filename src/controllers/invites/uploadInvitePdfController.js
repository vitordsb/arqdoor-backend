const path = require("path");
const fs = require("fs");
const uploadInvitePdfService = require("../../services/invites/uploadInvitePdfService");
const { validatePDF } = require("../../utils/validatePDF");

const normalizePdfPath = (filePath) => {
  if (!filePath) return "";
  const normalized = filePath.split(path.sep).join("/");
  const marker = "/uploads/";
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return normalized;
  return normalized.slice(idx + 1);
};

const uploadInvitePdfController = async (req, res, next) => {
  try {
    const inviteId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "Nenhum arquivo PDF foi enviado",
        success: false,
      });
    }

    // Validar o PDF antes de processar
    const buffer = fs.readFileSync(req.file.path);
    await validatePDF(buffer, req.file.originalname);

    const pdfPath = normalizePdfPath(req.file.path);
    const result = await uploadInvitePdfService(inviteId, pdfPath, req.user);

    return res.status(result.code).json(result);
  } catch (error) {
    // Se houver erro, remover o arquivo do disco
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`[uploadInvitePdfController] Arquivo removido após erro: ${req.file.path}`);
      } catch (unlinkError) {
        console.error(`[uploadInvitePdfController] Erro ao remover arquivo:`, unlinkError);
      }
    }

    // Passar erro para o middleware de erro global
    next(error);
  }
};

module.exports = uploadInvitePdfController;
