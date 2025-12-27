const getOneUserService = require("../../services/users/getOneUserService");

const getOneUserController = async (req, res) => {
  try {
    const user = await getOneUserService(req.params.id);

    return res.status(user.code).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      error: {
        details: [
          {
            controller: "UserController",
            message: "Erro interno",
          },
        ],
      },
      message: "Erro no UserGetOneController",
      success: false,
    });
  }
};

module.exports = getOneUserController;
