const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");
const createUserService = require("../users/createUserService");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const buildToken = (user) =>
  jwt.sign(
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
    },
    process.env.SECRET,
    { expiresIn: "10h" }
  );

const googleAuthService = async ({ idToken, type }) => {
  if (!process.env.SECRET) {
    return {
      code: 500,
      message: "Variável SECRET não configurada",
      success: false,
    };
  }

  if (!googleClientId || !googleClient) {
    return {
      code: 500,
      message: "GOOGLE_CLIENT_ID não configurado",
      success: false,
    };
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error("[googleAuth] erro ao verificar token:", error?.message || error);
    return {
      code: 401,
      message: "Token do Google inválido",
      success: false,
    };
  }

  const email = payload?.email;
  const emailVerified = payload?.email_verified;
  const nameFromGoogle = payload?.name;

  if (!email) {
    return {
      code: 400,
      message: "Email do Google não encontrado",
      success: false,
    };
  }

  if (!emailVerified) {
    return {
      code: 401,
      message: "E-mail do Google não verificado",
      success: false,
    };
  }

  const userType = type === "prestador" ? "prestador" : "contratante";
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    const token = buildToken(existingUser);
    return {
      code: 200,
      data: { token },
      message: "Login via Google realizado com sucesso",
      success: true,
    };
  }

  const fallbackName =
    (nameFromGoogle && nameFromGoogle.trim().slice(0, 100)) ||
    email.split("@")[0] ||
    "Usuário Google";

  const generatedPassword = crypto.randomBytes(16).toString("hex");
  const birth = new Date("1970-01-01");

  const created = await createUserService({
    name: fallbackName,
    email,
    password: generatedPassword,
    cpf: null,
    cnpj: null,
    type: userType,
    gender: "Prefiro não dizer",
    birth,
    termos_aceitos: true,
    is_email_verified: true,
    perfil_completo: false,
  });

  if (!created?.success) {
    return created;
  }

  const token = buildToken(created.user);

  return {
    code: 201,
    data: { token, user: created.user },
    message: "Usuário criado via Google com sucesso",
    success: true,
  };
};

module.exports = googleAuthService;
