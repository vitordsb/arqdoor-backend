const validatorID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const errors = [];
    if (!id) {
      errors.push({
        field: id,
        message: `O ${id} é obrigatório`,
      });
    } else if (!Number(id)) {
      errors.push({
        field: id,
        message: `O ${id} deve ser um número válido`,
      });
    } else if (Number(id) <= 0) {
      errors.push({
        field: id,
        message: `O ${id} não pode ser negativo ou zero`,
      });
    }

    if (errors.length !== 0) {
      return res.status(400).json({
        code: 400,
        errors,
        message: "Erro ao validar ID",
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
            validator: "ValidatorID",
            message: error.message,
          },
        ],
      },
      message: "Erro no ValidatorID",
      success: false,
    });
  }
};

module.exports = validatorID;
