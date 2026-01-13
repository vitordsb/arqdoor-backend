const path = require("path");
const uploadPdfService = require("../../services/upload/uploadPdfService");

const normalizePdfPath = (filePath) => {
  if (!filePath) return "";
  const normalized = filePath.split(path.sep).join("/");
  const marker = "/uploads/";
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return normalized;
  return normalized.slice(idx + 1);
};

const uploadPdfController = async (req, res, next) => {
  try {

    console.log("==========",req.files);

    
    const dataUpload = {
      // Pegando o id do ticket do parametro
      ticket_id: req.params.id,
      // Se não tiver o req.file, o pdf_path ficara ""
      pdf_path: req.file ? normalizePdfPath(req.file.path) : "",
    };

    const result = await uploadPdfService(dataUpload, req.user);
    // console.log(result);

    // Se não voltar nada, o pdf está pronto para continuar
    if (!result) {
      return next();
    }

    // Se chegou aqui, o pdf foi criado
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "uploadPdfController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no uploadPdfController",
      success: false,
    });
  }
};

module.exports = uploadPdfController;
