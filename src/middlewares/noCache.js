/**
 * Middleware para desabilitar cache em rotas dinâmicas
 * Garante que o usuário sempre receba a versão mais recente dos dados
 */
module.exports = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
};
