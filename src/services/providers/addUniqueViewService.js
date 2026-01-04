const ServiceProvider = require("../../models/ServiceProvider");
const ProviderView = require("../../models/ProviderView");

const addUniqueViewService = async (providerId, viewerId) => {
  const provider = await ServiceProvider.findByPk(providerId);
  if (!provider) {
    return { code: 404, message: "Provider não encontrado", success: false };
  }

  if (provider.user_id === viewerId) {
    return { code: 200, message: "Visualização ignorada (próprio usuário)", success: true, provider };
  }

  const [view, created] = await ProviderView.findOrCreate({
    where: { provider_id: providerId, viewer_user_id: viewerId },
    defaults: { provider_id: providerId, viewer_user_id: viewerId },
  });

  if (created) {
    provider.views_profile += 1;
    await provider.save();
  }

  return { code: 200, success: true, provider, newView: created };
};

module.exports = addUniqueViewService;
