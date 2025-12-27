const ServiceProvider = require("../../models/ServiceProvider");
const User = require("../../models/User");

const createProviderService = async (dataProvider) => {
  try {
    // validar se o user_id e realmente um provider
    const user = await User.findByPk(dataProvider.user_id);
    if (!user) {
      return {
        code: 404,
        error: {
          details: [
            {
              field: "user_id",
              message: "O usuario não foi encontrado",
            },
          ],
        },
        message: "Erro ao encontrar usuario",
        success: false,
      };
    }

    if (user.type !== "prestador") {
      return {
        code: 400,
        error: {
          details: [
            {
              field: "type",
              message: "O usuario não e do tipo 'prestador'",
            },
          ],
        },
        message: "Erro ao criar provider",
        success: false,
      };
    }
    // Validar se esse usuario já não esta na lista
    if (ServiceProvider.findOne({ where: { user_id: dataProvider.user_id } })) {
      return {
        code: 400,
        error: {
          details: [
            {
              field: "id_user",
              message: "O usuario já esta na lista",
            },
          ],
        },
        message: "Erro ao criar provider",
        success: false,
      };
    }

    // criar
    const provider = await ServiceProvider.create(dataProvider);

    return {
      code: 201,
      provider,
      message: "provider criado com sucesso",
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = createProviderService;
