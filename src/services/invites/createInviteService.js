const crypto = require("crypto");
const GhostInvite = require("../../models/GhostInvite");
const ServiceProvider = require("../../models/ServiceProvider");
const normalizeInviteSteps = require("./normalizeInviteSteps");

const generateToken = () => crypto.randomBytes(20).toString("hex");

const createInviteService = async (data, user) => {
  try {
    if (!user || user.type !== "prestador") {
      return {
        code: 403,
        message: "Apenas prestadores podem criar convites.",
        success: false,
      };
    }

    const provider = await ServiceProvider.findOne({
      where: { user_id: user.id },
    });
    if (!provider) {
      return {
        code: 404,
        message: "Prestador não encontrado.",
        success: false,
      };
    }

    const { steps, error } = normalizeInviteSteps(data.steps);
    if (error) {
      return {
        code: 400,
        message: error,
        success: false,
      };
    }

    let token = generateToken();
    let attempt = 0;
    while (attempt < 3) {
      const exists = await GhostInvite.findOne({ where: { token } });
      if (!exists) break;
      token = generateToken();
      attempt += 1;
    }

    const invite = await GhostInvite.create({
      user_id: user.id,
      provider_id: provider.provider_id,
      token,
      title: data.title || null,
      description: data.description || null,
      payment_preference: data.payment_preference || provider.payment_preference || "at_end",
      steps,
      status: "draft",
    });

    return {
      code: 201,
      message: "Convite criado com sucesso.",
      success: true,
      invite,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      message: error?.message || "Erro interno ao criar convite.",
      success: false,
    };
  }
};

module.exports = createInviteService;
