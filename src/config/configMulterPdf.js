const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { MAX_PDF_SIZE_BYTES } = require("../constants/validation");

const raizDoProjeto = path.join(__dirname, "..", "..");

const uploadDir = path.join(raizDoProjeto, "uploads");
const pdfDir = path.join(uploadDir, "pdfs");

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];

  if (!allowedTypes.includes(file.mimetype)) {
    console.log("❌ Arquivo rejeitado: tipo inválido -", file.mimetype);
    const erro = new Error("Tipo de arquivo inválido. Apenas PDFs são permitidos.");
    erro.statusCode = 400;
    erro.erros = {
      error: "Tipo de arquivo inválido",
      validType: allowedTypes,
      receivedType: file.mimetype
    };
    return cb(erro, false);
  }

  cb(null, true);
};

// Declarar o armazenamento para o multer trabalhar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir);
  },
  filename: (req, file, cb) => {
    // Pegando a data para renomear o arquivo
    const date = new Date().getTime();
    // Pegando o tipo do arquivo para nomeá-lo
    const type = file.mimetype.split("/");
    cb(null, `${date}.${type[1]}`);
  },
});

// Configuração do multer com limite de tamanho
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_PDF_SIZE_BYTES, // 10MB
    files: 1 // Apenas 1 arquivo por vez
  }
});

module.exports = { storage, fileFilter, upload };
