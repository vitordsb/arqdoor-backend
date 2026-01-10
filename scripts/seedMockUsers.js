/*
 * Script to generate mock users in the database.
 * Usage:
 *   node scripts/seedMockUsers.js --count 30
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const createUserService = require("../src/services/users/createUserService");
const ServiceProvider = require("../src/models/ServiceProvider");
const sequelize = require("../src/database/config");

const DEFAULT_COUNT = 30;
const MAX_RETRIES = 6;
const DEFAULT_PASSWORD = "12345678";

const firstNames = [
  "Ana",
  "Bruno",
  "Carla",
  "Daniel",
  "Eduardo",
  "Fernanda",
  "Gabriel",
  "Helena",
  "Igor",
  "Juliana",
  "Kaique",
  "Larissa",
  "Marcos",
  "Nadia",
  "Otavio",
  "Patricia",
  "Rafael",
  "Sabrina",
  "Tiago",
  "Vitoria",
  "William",
  "Yasmin",
];

const lastNames = [
  "Almeida",
  "Barbosa",
  "Cardoso",
  "Dias",
  "Esteves",
  "Ferreira",
  "Gomes",
  "Henrique",
  "Ibrahim",
  "Jesus",
  "Lopes",
  "Moura",
  "Nascimento",
  "Oliveira",
  "Pereira",
  "Queiroz",
  "Ramos",
  "Silva",
  "Teixeira",
  "Uchoa",
  "Vieira",
];

const professions = [
  "Arquitetura residencial",
  "Design de interiores",
  "Engenharia civil",
  "Projetos comerciais",
  "Paisagismo",
  "Regularizacao e licencas",
  "Reformas e retrofit",
  "Sustentabilidade",
  "Projetos 3D",
  "Consultoria de obra",
];

const aboutSnippets = [
  "Foco em projetos funcionais com entrega clara.",
  "Experiencia com reformas e acompanhamento remoto.",
  "Especialista em alinhamento de briefing e etapas.",
  "Atuacao em projetos residenciais de alto padrao.",
  "Apoio completo do conceito a documentacao final.",
];

const genders = ["Masculino", "Feminino", "Prefiro não dizer"];

const usedEmails = new Set();
const usedCpfs = new Set();
const usedCnpjs = new Set();
const runId = Date.now().toString(36);

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const randomBirthDate = () => {
  const start = new Date(1970, 0, 1).getTime();
  const end = new Date(2004, 0, 1).getTime();
  return new Date(start + Math.random() * (end - start));
};

const randomDigits = (length) => {
  let value = "";
  while (value.length < length) {
    value += Math.floor(Math.random() * 10);
  }
  return value.slice(0, length);
};

const generateUniqueDigits = (length, usedSet) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = randomDigits(length);
    if (!usedSet.has(candidate)) {
      usedSet.add(candidate);
      return candidate;
    }
  }
  throw new Error(`Unable to generate unique digits (${length}).`);
};

const parseCountArg = () => {
  const args = process.argv.slice(2);
  const index = args.indexOf("--count");
  if (index === -1) return DEFAULT_COUNT;
  const value = Number.parseInt(args[index + 1], 10);
  if (Number.isNaN(value) || value <= 0) return DEFAULT_COUNT;
  return value;
};

const buildUserPayload = (index, attempt) => {
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const type = index % 2 === 0 ? "prestador" : "contratante";
  const email = `${firstName}.${lastName}.${runId}.${index}.${attempt}@example.com`
    .toLowerCase()
    .replace(/[^a-z0-9@.]/g, "");

  const addCpf = Math.random() > 0.4;
  const addCnpj = type === "prestador" && Math.random() > 0.6;

  const cpf = addCpf ? generateUniqueDigits(11, usedCpfs) : null;
  const cnpj = addCnpj ? generateUniqueDigits(14, usedCnpjs) : null;

  if (usedEmails.has(email)) {
    return buildUserPayload(index, attempt + 1);
  }
  usedEmails.add(email);

  return {
    name: `${firstName} ${lastName}`,
    email,
    password: DEFAULT_PASSWORD,
    birth: randomBirthDate(),
    gender: pick(genders),
    type,
    cpf,
    cnpj,
    termos_aceitos: true,
    is_email_verified: true,
    perfil_completo: Math.random() > 0.3,
  };
};

const updateProviderProfile = async (userId) => {
  const profession = pick(professions);
  const about = pick(aboutSnippets);
  const rating = Number((3.2 + Math.random() * 1.7).toFixed(2));
  const viewsProfile = Math.floor(Math.random() * 420);
  const paymentPreference = Math.random() > 0.5 ? "per_step" : "at_end";

  await ServiceProvider.update(
    {
      profession,
      about,
      rating_mid: rating,
      views_profile: viewsProfile,
      payment_preference: paymentPreference,
    },
    { where: { user_id: userId } }
  );
};

const seedUsers = async () => {
  const count = parseCountArg();
  const createdUsers = [];
  const failedUsers = [];

  for (let i = 0; i < count; i += 1) {
    let created = false;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      const payload = buildUserPayload(i, attempt);
      const result = await createUserService(payload);

      if (result?.success) {
        createdUsers.push(result.user);
        if (result.user.type === "prestador") {
          await updateProviderProfile(result.user.id);
        }
        created = true;
        break;
      }

      if (result?.code === 409) {
        continue;
      }

      failedUsers.push({ index: i, message: result?.message || "Unknown error" });
      created = true;
      break;
    }

    if (!created) {
      failedUsers.push({ index: i, message: "Retries exhausted" });
    }
  }

  console.log("Mock user seeding finished.");
  console.log(`Created: ${createdUsers.length}`);
  if (failedUsers.length) {
    console.log(`Failed: ${failedUsers.length}`);
    failedUsers.forEach((item) => {
      console.log(`- index ${item.index}: ${item.message}`);
    });
  }
};

seedUsers()
  .catch((error) => {
    console.error("Seed failed:", error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch (error) {
      console.error("Error closing database:", error?.message || error);
    }
  });
