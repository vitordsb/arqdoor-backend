const { Op } = require("sequelize");
const User = require("../../models/User");

const updateUserService = async (dataUser, id_user) => {
  try {
    const user = await User.findByPk(id_user);
    if (!user) {
      return {
        code: 404,
        message: "Usuario não encontrado",
        success: false,
      };
    }

    if (dataUser.email && dataUser.email !== user.email) {
      const existsEmail = await User.findOne({
        where: {
          email: dataUser.email,
          id: { [Op.ne]: user.id },
        },
      });
      if (existsEmail) {
        return {
          code: 409,
          error: {
            details: [
              {
                field: "email",
                message: "O email enviado já existe",
              },
            ],
          },
          message: "Erro ao atualizar usuario",
          success: false,
        };
      }
    }

    // se tiver cpf, validar se existe cpf
    if (dataUser.cpf && dataUser.cpf !== user.cpf) {
      const existsCpf = await User.findOne({
        where: {
          cpf: dataUser.cpf,
          id: { [Op.ne]: user.id },
        },
      });
      if (existsCpf) {
        return {
          code: 409,
          error: {
            details: [
              {
                field: "cpf",
                message: "O cpf enviado já esta sendo usado",
              },
            ],
          },
          message: "Erro ao atualizar usuario",
          success: false,
        };
      }
    }

    // Se tiver cnpj, validar o cnpj
    if (dataUser.cnpj && dataUser.cnpj !== user.cnpj) {
      const existsCnpj = await User.findOne({
        where: {
          cnpj: dataUser.cnpj,
          id: { [Op.ne]: user.id },
        },
      });
      if (existsCnpj) {
        return {
          code: 409,
          error: {
            details: [
              {
                field: "cnpj",
                message: "O cnpj enviado já esta sendo usado",
              },
            ],
          },
          message: "Erro ao validar usuario",
          success: false,
        };
      }
    }

    // atualizar usuario
    await user.update(dataUser);

    return {
      code: 200,
      user,
      message: "User atualizado com sucesso",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateUserService;
