const multer = require("multer");
const path = require("path");
const fs = require("fs");
const raizDoProjeto = path.join(__dirname, "..", "..", "..");

// busca a pasta uploads na raiz do projeto
const uploadDir = path.join(raizDoProjeto, "uploads");

// se a pasta não existir, criar ela
// if (!fs.existsSync(uploadDir)) {
//   console.log("não existe essa pasta");
//   fs.mkdirSync(uploadDir);
// }

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];

  if (!allowedTypes.includes(file.mimetype)) {
    console.log("Arquivo rejeitado: tipo inválido");
    const erro = new Error("Arquivo rejeitado: tipo inválido");

    erro.statusCode = 400; // Podemos usar depois no middleware
    erro.erros = { error: "Tipo de arquivo invalido", validType: allowedTypes };
    return cb(erro, false);
  }

  cb(null, true); // Aceita a imagem
};
// declarar o armazenamento para o multer trabalhar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/pdfs/"); // pasta aonde ficara salvo
  },
  filename: (req, file, cb) => {
    // Pegando a data para renomear o arquivo
    const date = new Date().getTime();
    // Pegando o tipo do arquivo para nomea-lo
    const type = file.mimetype.split("/");
    cb(null, `${date}.${type[1]}`);
  },
});

module.exports = { storage, fileFilter };
