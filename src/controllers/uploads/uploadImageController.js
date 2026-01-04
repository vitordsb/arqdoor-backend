const uploadImageService = require("../../services/upload/uploadImageService");

const uploadImageController = async (req, res) => {
  try {
    
    if (!req.body.type) {
      return res.status(400).json({
        code: 400,
        message: "Erro, o 'type' é obrigatorio",
      });
    }
    const dataUpload = {
      user_id: req.user.id,
      image_path: req.file.path,
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

module.exports = uploadImageController;
