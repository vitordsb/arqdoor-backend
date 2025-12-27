const createUserService = require("../users/createUserService");

const jwt = require("jsonwebtoken");

const registerUserService = async (dataUser) => {
  try {
    const user = await createUserService(dataUser);
    if (!user.success) {
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
      },
      process.env.SECRET,
      { expiresIn: "10h" },
    );

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
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = registerUserService;
