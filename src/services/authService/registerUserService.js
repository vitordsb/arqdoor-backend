const createUserService = require("../users/createUserService");
const jwt = require("jsonwebtoken");
const sequelize = require("../../database/config");

const registerUserService = async (dataUser) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await createUserService(dataUser, { transaction });
    if (!user.success) {
      await transaction.rollback();
      return user;
    }

    const token = jwt.sign(
      {
        id: user.user.id,
        name: user.user.name,
        email: user.user.email,
        cpf: user.user.cpf,
        cnpj: user.user.cnpj,
        type: user.user.type,
        cidade_id: user.user.cidade_id,
        perfil_completo: user.user.perfil_completo,
        signature_password_set: user.user.signature_password_set,
      },
      process.env.SECRET,
      { expiresIn: "10h" },
    );

    await transaction.commit();

    return {
      code: 201,
      data: {
        token,
        user,
      },
      message: "Usuario cadastrado com sucesso",
      success: true,
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = registerUserService;
