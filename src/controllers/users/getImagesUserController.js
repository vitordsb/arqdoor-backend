const getImagesUserService = require("../../services/users/getImagesUserService");

const getImagesUserController = async (req, res) => {
  try {
    const imagesUser = await getImagesUserService(req.params.id);
    return res.status(imagesUser.code).json(imagesUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "getImagesUserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no getImagesUserController",
      success: false,
    });
  }
};

module.exports = getImagesUserController;
