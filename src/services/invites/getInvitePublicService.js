const GhostInvite = require("../../models/GhostInvite");
const ServiceProvider = require("../../models/ServiceProvider");
const User = require("../../models/User");

const getInvitePublicService = async (token) => {
  try {
    const invite = await GhostInvite.findOne({ where: { token } });
    if (!invite) {
      return {
        code: 404,
        message: "Convite não encontrado.",
        success: false,
      };
    }

    const provider = await ServiceProvider.findByPk(invite.provider_id);
    const providerUser = provider
      ? await User.findByPk(provider.user_id)
      : null;

    return {
      code: 200,
      message: "Convite carregado.",
      success: true,
      invite,
      provider: provider
        ? {
            provider_id: provider.provider_id,
            profession: provider.profession,
            user: providerUser
              ? {
                  id: providerUser.id,
                  name: providerUser.name,
                  email: providerUser.email,
                  type: providerUser.type,
                }
              : null,
          }
        : null,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro ao carregar convite.",
      success: false,
    };
  }
};

module.exports = getInvitePublicService;
