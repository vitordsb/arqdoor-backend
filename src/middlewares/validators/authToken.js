const jwt = require("jsonwebtoken");

const authToken = async (req, res, next) => {
  try {
    // receber o token
    // receber o token (Header ou Cookie)
    if (!req.headers.authorization && !req.cookies?.token) {
      return res.status(401).json({
        code: 401,
        message: "Acesso negado: Token não fornecido",
        success: false,
      });
    }

    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.headers.authorization ||
      req.cookies?.token;



    // validar o token
    if (!token) {
      return res.status(409).json({
        code: 409,
        message: "Acesso negado",
        success: "false",
      });
    }
    // verificar o token com o secret
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.status(409).json({
          code: 409,
          message: "Acesso negado",
          success: "false",
        });
      }

      req.user = user;

      return next();  
      // console.log("teste");
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            validator: "AuthToken",
            message: error.message,
          },
        ],
      },
      message: "Erro no AuthToken",
      success: false,
    });
  }
};

module.exports = authToken;
