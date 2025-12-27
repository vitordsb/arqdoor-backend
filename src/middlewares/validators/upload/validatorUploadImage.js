const validatorUploadImage = async (req, res) => {
  try {
    console.log(req.type);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            validator: "AuthvalidatorUploadImageToken",
            message: error.message,
          },
        ],
      },
      message: "Erro no AutvalidatorUploadImagehToken",
      success: false,
    });
  }
};

module.exports = validatorUploadImage;
