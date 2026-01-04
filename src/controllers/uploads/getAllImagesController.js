const getAllImagesService = require("../../services/upload/getAllImagesService");

const getAllImagesController = async (req, res) => {
  try {
    const images = await getAllImagesService(req.query.user);
    return res.status(images.code).json(images);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getAllImagesController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getAllImagesController",
      success: false,
    });
  }
};

module.exports = getAllImagesController;
