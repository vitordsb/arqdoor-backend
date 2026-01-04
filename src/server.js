require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const https = require("https");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

app.post("/webhook/deploy", (req, res) => {
  const token = req.headers["x-deploy-token"];

  if (!token || token !== process.env.DEPLOY_TOKEN) {
    return res.status(403).send("Forbidden");
  }

  exec("/var/www/arqdoor-backend/deploy.sh", (error, stdout, stderr) => {
    if (error) {
      console.error("Deploy error:", error);
      console.error(stderr);
      return res.status(500).send("Deploy failed");
    }

    console.log(stdout);
    if (stderr) console.error(stderr);
    return res.send("Deploy OK");
  });
});


const valENV = require("./utils/valEnv");
const sequelize = require("./database/config");
const router = require("./routers/router");
const { swaggerUi, swaggerSpec } = require("../swagger");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://arqdoor-app.vercel.app", "https://arqdoor.com", "https://www.arqdoor.com"],
    credentials: true,
  })
);


const raizDoProjeto = path.join(__dirname, "..");
const uploadsDir = path.join(raizDoProjeto, "uploads");
console.log("[uploads] raizDoProjeto =", raizDoProjeto);
console.log("[uploads] uploadsDir    =", uploadsDir);

try {
  require("fs").accessSync(uploadsDir);
} catch {
  console.warn("[uploads] pasta não encontrada:", uploadsDir);
}

app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou restrinja aos hosts acima
  next();
});

app.use(
  "/uploads",
  express.static(path.join(raizDoProjeto, "uploads"), {
    setHeaders(res, filePath) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${path.basename(filePath)}"`
        );
      }
    },
  })
);

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(router);
app.use("/", (req, res) => {
  res.message =
    "Essa não é uma rota válida, por favor verifique a documentação";
  setTimeout(() => {
    res.status(404).send(res.message);
  }, 1000);
});

const funcValidENV = async () => {
  const variableIsValid = await valENV();
  if (variableIsValid) {
    console.log(variableIsValid);
    process.exit(1);
  }
};
funcValidENV();

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco estabelecida");
    // mantém o schema alinhado com os models sem precisar rodar migrações manuais
    // Evitamos alterações automáticas em produção para não criar índices duplicados (limite de 64 no MySQL)
    const enableSync = process.env.ENABLE_DB_SYNC === "true";
    const alterSync = process.env.ENABLE_DB_SYNC_ALTER === "true";
    if (!enableSync) {
      console.log("Sincronização automática desabilitada (ENABLE_DB_SYNC=false)");
      return null;
    }
    console.log(
      `Sincronizando modelos (alter=${alterSync ? "true" : "false"}) - use migrações para mudanças estruturais`
    );
    return sequelize.sync({ alter: alterSync });
  })
  .then(async () => {
    // garante que o usuário admin exista
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "arqdoor@admin.com.br";
      const adminPassword = process.env.ADMIN_PASSWORD || "6aseqcx13zerq513";
      const existing = await User.findOne({ where: { email: adminEmail } });
      if (!existing) {
        const hashed = bcrypt.hashSync(adminPassword, 10);
        await User.create({
          name: "ArqDoor ADM",
          email: adminEmail,
          password: hashed,
          birth: new Date("1990-01-01"),
          gender: "Prefiro não dizer",
          type: "contratante",
          termos_aceitos: true,
          perfil_completo: true,
          is_email_verified: true,
        });
        console.log("[admin] Usuário admin criado");
      } else {
        console.log("[admin] Usuário admin já existe");
      }
    } catch (e) {
      console.warn("[admin] Falha ao garantir usuário admin:", e?.message || e);
    }

    app.listen(PORT, () => {
      console.log("==========================================");
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log("==========================================");
    });

    https
      .createServer(
        {
          cert: fs.readFileSync("src/SSL/code.crt"),
          key: fs.readFileSync("src/SSL/code.key"),
        },
        app
      )
      .listen(8081, () => console.log("Servidor Rodando em Https"));
  })
  .catch((error) => {
    console.error("Erro na conexão ou sincronização:", error);
  });
