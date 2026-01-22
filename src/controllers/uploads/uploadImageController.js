const { uploadImageService, deleteImageService } = require("../../services/upload/uploadImageService");
const path = require("path");

const uploadImageController = async (req, res) => {
  try {
    
    if (!req.body.type) {
      return res.status(400).json({
        code: 400,
        message: "Erro, o 'type' é obrigatorio",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "Erro: Nenhum arquivo enviado ou inválido.",
      });
    }

    const dataUpload = {
      user_id: req.user.id,
      image_path: req.file.path.split(path.sep).join("/"),
      type: req.body.type,
    };
    const imageUpload = await uploadImageService(dataUpload);
    return res.status(imageUpload.code).json(imageUpload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "uploadImageController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no uploadImageController",
      success: false,
    });
  }
};

const deleteImageController = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        code: 400,
        message: "Erro, o 'type' é obrigatório",
      });
    }

    if (!["perfil", "banner"].includes(type)) {
      return res.status(400).json({
        code: 400,
        message: "Tipo de imagem inválido para remoção. Use 'perfil' ou 'banner'.",
      });
    }

    const result = await deleteImageService(req.user.id, type);
    return res.status(result.code).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Erro no deleteImageController",
      success: false,
    });
  }
};

module.exports = { uploadImageController, deleteImageController };
