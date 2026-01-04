const validatorProfile = async (req, res, next) => {
  try {
    console.log(req.user);
    const errors = [];

    if (!req.user.termos_aceitos) {
      errors.push({
        field: "termos aceitos",
        success: false,
        message: "Os termos não foram aceitos",
      });
    }

    if (!req.user.perfil_completo) {
      errors.push({
        field: "perfil_completo",
        success: false,
        message: "O perfil não esta completo",
      });
    }

    if (errors.length !== 0) {
      return res.status(400).json({
        code: 400,
        errors,
        message: "Erro ao validar o perfil",
        success: false,
      });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            validator: "ValidatorProfile",
            message: error.message,
          },
        ],
      },
      message: "Erro no ValidatorProfile",
      success: false,
    });
  }
};

module.exports = validatorProfile;
