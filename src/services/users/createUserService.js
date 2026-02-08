const User = require("../../models/User");
const bycrypt = require("bcryptjs");
// const CreateProviderService = require("../providerService/CreateProviderService");
const sequelize = require("../../database/config");
const ServiceProvider = require("../../models/ServiceProvider");
const consultarCNPJ = require("../utils/cnpjService");

const createUserService = async (dataUser, options = {}) => {
  const t = options.transaction || await sequelize.transaction();
  const isExternalTransaction = !!options.transaction;

  try {
    // validar email
    const existsEmail = await User.findOne({
      where: { email: dataUser.email },
      transaction: t,
    });
    if (existsEmail) {
      if (!isExternalTransaction) await t.rollback();
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
        transaction: t,
      });
      if (existsCpf) {
        if (!isExternalTransaction) await t.rollback();
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
      // 1. Verificar unicidade no banco local
      const existsCnpj = await User.findOne({
        where: { cnpj: dataUser.cnpj },
        transaction: t,
      });
      if (existsCnpj) {
        if (!isExternalTransaction) await t.rollback();
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

      // 2. Validar na Receita Federal via BrasilAPI
      try {
        const dadosCnpj = await consultarCNPJ(dataUser.cnpj);

        // Verificar se está ATIVA
        if (dadosCnpj.descricao_situacao_cadastral !== 'ATIVA') {
          if (!isExternalTransaction) await t.rollback();
          return {
            code: 400,
            error: {
              details: [{
                field: "cnpj",
                message: `CNPJ com situação cadastral ${dadosCnpj.descricao_situacao_cadastral}. Apenas empresas ATIVAS podem se cadastrar.`
              }]
            },
            message: "CNPJ inválido ou inativo",
            success: false
          };
        }

        // Feature futura: Preencher dados automaticamente se necessário
        // dataUser.name = dataUser.name || dadosCnpj.razao_social;

      } catch (apiError) {
        if (!isExternalTransaction) await t.rollback();
        return {
          code: 400, // Bad Request pois o CNPJ é inválido
          error: {
            details: [{
              field: "cnpj",
              message: apiError.message
            }]
          },
          message: "Erro na validação do CNPJ",
          success: false
        };
      }
    }

    //criptografar a senha
    const passwordCript = await bycrypt.hashSync(dataUser.password, 12);
    dataUser.password = passwordCript;

    const signaturePasswordSet =
      typeof dataUser.signature_password_set === "boolean"
        ? dataUser.signature_password_set
        : true;

    const user = await User.create(
      {
        ...dataUser,
        signature_password_set: signaturePasswordSet,
        provider: dataUser.provider || "local",
      },
      { transaction: t }
    );

    // se o usuario for um prestador, criar ele na tabela prestador
    if (user.type === "prestador") {
      // criar
      await ServiceProvider.create(
        { user_id: user.id, profession: "" },
        { transaction: t },
      );
    }

    if (!isExternalTransaction) await t.commit();
    return {
      code: 201,
      user,
      message: "User criado com sucesso",
      success: true,
    };
  } catch (error) {
    if (!isExternalTransaction) await t.rollback();
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createUserService;
