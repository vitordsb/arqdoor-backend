const jwt = require("jsonwebtoken");

const authToken = async (req, res, next) => {
  try {
    // receber o token
    if (!req.headers.authorization) {
      return res.status(409).json({
        code: 409,
        message: "Acesso negado",
        success: "false",
      });
    }

    const token =
      req.headers.authorization.split(" ")[1] || req.headers.authorization;



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
