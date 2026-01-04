const ProviderRating = require("../../models/ProviderRating");
const ServiceProvider = require("../../models/ServiceProvider");
const User = require("../../models/User");

const getRatings = async (providerId, viewerId) => {
  const provider = await ServiceProvider.findByPk(providerId);
  if (!provider) return { code: 404, message: "Provider não encontrado", success: false };

  const ratings = await ProviderRating.findAll({
    where: { provider_id: providerId },
    include: [{ model: User, as: "User", attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  });

  const average =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.grade, 0) / ratings.length
      : 0;

  const viewerRating = viewerId
    ? ratings.find((r) => r.user_id === viewerId)
    : null;

  return {
    code: 200,
    success: true,
    ratings: ratings.map((r) => ({
      id: r.id,
      grade: r.grade,
      comment: r.comment,
      user: r.User ? { id: r.User.id, name: r.User.name, avatar: r.User.avatar } : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user_id: r.user_id,
    })),
    average,
    count: ratings.length,
    viewerRating: viewerRating
      ? {
          id: viewerRating.id,
          grade: viewerRating.grade,
          comment: viewerRating.comment,
        }
      : null,
  };
};

const upsertRating = async (providerId, userId, grade, comment) => {
  const provider = await ServiceProvider.findByPk(providerId);
  if (!provider) return { code: 404, message: "Provider não encontrado", success: false };

  const existing = await ProviderRating.findOne({ where: { provider_id: providerId, user_id: userId } });
  if (existing) {
    existing.grade = grade;
    existing.comment = comment;
    await existing.save();
    return { code: 200, success: true, rating: existing, action: "updated" };
  }
  const rating = await ProviderRating.create({ provider_id: providerId, user_id: userId, grade, comment });
  return { code: 201, success: true, rating, action: "created" };
};

const deleteRating = async (providerId, userId) => {
  const destroyed = await ProviderRating.destroy({ where: { provider_id: providerId, user_id: userId } });
  return destroyed
    ? { code: 200, success: true }
    : { code: 404, success: false, message: "Avaliação não encontrada" };
};

module.exports = { getRatings, upsertRating, deleteRating };
