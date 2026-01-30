const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");
const createUserService = require("../users/createUserService");

const googleClientId = process.env.GOOGLE_CLIENT_ID || "1084357165027-u9j7m9bdhle14p84d7931j332f9bt9on.apps.googleusercontent.com";
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
      signature_password_set: user.signature_password_set,
    },
    process.env.SECRET,
    { expiresIn: "10h" }
  );

const googleAuthService = async ({ idToken, accessToken, type, mode }) => {
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

  let email;
  let emailVerified;
  let nameFromGoogle;

  if (idToken) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      email = payload?.email;
      emailVerified = payload?.email_verified;
      nameFromGoogle = payload?.name;
    } catch (error) {
      console.error("[googleAuth] erro ao verificar idToken:", error?.message || error);
      return {
        code: 401,
        message: "Token do Google inválido",
        success: false,
      };
    }
  } else if (accessToken) {
    try {
      const tokenInfo = await googleClient.getTokenInfo(accessToken);
      const audience = tokenInfo.aud || tokenInfo.audience;
      if (audience && audience !== googleClientId) {
        return {
          code: 401,
          message: "Token do Google não corresponde ao client configurado",
          success: false,
        };
      }

      email = tokenInfo.email;
      emailVerified =
        tokenInfo.email_verified === true ||
        tokenInfo.email_verified === "true" ||
        tokenInfo.verified_email === true ||
        tokenInfo.verified_email === "true";

      // Tenta enriquecer com nome via userinfo
      try {
        const profile = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (profile?.data) {
          nameFromGoogle = profile.data.name || profile.data.given_name || profile.data.family_name;
          if (profile.data.email && !email) email = profile.data.email;
          if (profile.data.email_verified !== undefined && emailVerified === undefined) {
            emailVerified = !!profile.data.email_verified;
          }
        }
      } catch (profileErr) {
        console.warn("[googleAuth] Falha ao buscar userinfo:", profileErr?.message || profileErr);
      }
    } catch (error) {
      console.error("[googleAuth] erro ao verificar accessToken:", error?.message || error);
      return {
        code: 401,
        message: "Token do Google inválido",
        success: false,
      };
    }
  }

  if (!email) {
    return {
      code: 400,
      message: "Email do Google não encontrado",
      success: false,
    };
  }

  if (emailVerified === false || emailVerified === "false") {
    return {
      code: 401,
      message: "E-mail do Google não verificado",
      success: false,
    };
  }

  const userType = type === "prestador" ? "prestador" : "contratante";
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    // Se veio pelo fluxo de registro mas já existe, oriente a fazer login
    // REMOVIDO: Isso estava bloqueando login de usuários Google existentes
    // if (mode === "register") {
    //   return {
    //     code: 409,
    //     message: "Usuário já conectado com Google, por favor faça login.",
    //     success: false,
    //   };
    // }

    // Permite login híbrido (Google + Senha) se o email for verificado
    if (existingUser.provider === "local") {
      // Opcional: Atualizar provider para indicar vínculo ou manter "local"
      console.log(`[GoogleAuth] Usuário local ${email} autenticou via Google.`);
    }

    // Se o provider é NULL (usuário legado), atualizar para 'google'
    if (!existingUser.provider || existingUser.provider === null) {
      await existingUser.update({ provider: "google" });
    }

    if (
      existingUser.signature_password_set === null ||
      existingUser.signature_password_set === undefined
    ) {
      await existingUser.update({ signature_password_set: false });
    }

    const token = buildToken(existingUser);
    return {
      code: 200,
      data: {
        token,
        needs_onboarding: !existingUser.perfil_completo,
      },
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
    signature_password_set: false,
    provider: "google",
  });

  if (!created?.success) {
    return created;
  }

  const token = buildToken(created.user);

  return {
    code: 201,
    data: {
      token,
      user: created.user,
      needs_onboarding: true,
    },
    message: "Usuário criado via Google com sucesso",
    success: true,
  };
};

module.exports = googleAuthService;
