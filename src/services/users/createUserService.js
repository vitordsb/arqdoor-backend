const User = require("../../models/User");
const bycrypt = require("bcryptjs");
// const CreateProviderService = require("../providerService/CreateProviderService");
const sequelize = require("../../database/config");
const ServiceProvider = require("../../models/ServiceProvider");

const createUserService = async (dataUser) => {
  const t = await sequelize.transaction();

  try {
    // validar email
    const existsEmail = await User.findOne({
      where: { email: dataUser.email },
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
        message: "Erro ao validar usuario",
        success: false,
      };
    }

    // Se tiver cpf, validar o cpf
    if (dataUser.cpf) {
      const existsCpf = await User.findOne({
        where: { cpf: dataUser.cpf },
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
          message: "Erro ao validar usuario",
          success: false,
        };
      }
    }

    // Se tiver cnpj, validar o cnpj
    if (dataUser.cnpj) {
      const existsCnpj = await User.findOne({
        where: { cnpj: dataUser.cnpj },
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

    //criptografar a senha
    const passwordCript = await bycrypt.hashSync(dataUser.password, 12);
    dataUser.password = passwordCript;

    const user = await User.create(dataUser, { transaction: t });

    // se o usuario for um prestador, criar ele na tabela prestador
    if (user.type === "prestador") {
      // criar
      await ServiceProvider.create(
        { user_id: user.id, profession: "" },
        { transaction: t },
      );
    }

    await t.commit();
    return {
      code: 201,
      user,
      message: "User criado com sucesso",
      success: true,
    };
  } catch (error) {
    await t.rollback();
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createUserService;
