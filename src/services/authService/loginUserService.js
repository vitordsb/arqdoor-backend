const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUserService = async (dataUser) => {
  try {
    // validar se existe um usuario com esse email
    const user = await User.findOne({ where: { email: dataUser.email } });
    if (!user) {
      return {
        code: 401,
        error: {
          message: "Credenciais inválidas",
        },
        success: false,
      };
    }

    // discriptografar a senha e validar
    const passwordDecode = await bcrypt.compareSync(
      dataUser.password,
      user.password
    );
    if (!passwordDecode) {
      return {
        code: 401,
        error: {
          message: "Credenciais inválidas",
        },
        success: false,
      };
    }
    //  se a senha do usuario achado e igual com a senha discriptografada

    let signaturePasswordSet = user.signature_password_set;
    if (signaturePasswordSet === null || signaturePasswordSet === undefined) {
      signaturePasswordSet = true;
      await user.update({ signature_password_set: true });
    }

    const token = await jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        cnpj: user.cnpj,
        type: user.type,
        cidade_id: user.cidade_id,
        termos_aceitos: user.termos_aceitos,
        perfil_completo: user.perfil_completo,
        signature_password_set: signaturePasswordSet,
      },
      process.env.SECRET,
      { expiresIn: "10h" }
    );

    return {
      code: 200,
      data: {
        token,
      },
      message: "Login realizado com sucesso",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = loginUserService;
