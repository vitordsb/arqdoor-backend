const Portfolio = require("../../models/Portfolio");
const User = require("../../models/User");
const UserImage = require("../../models/UserImages");
const PortfolioLike = require("../../models/PortfolioLike");
const PortfolioComment = require("../../models/PortfolioComment");

const getAllPostPortfolioService = async (query) => {
  try {
    if (query) {
      const posts = await Portfolio.findAll({
        where: { user_id: query },
        include: [
          { model: User, required: true, as: "User" },
          { model: UserImage, required: true, as: "UserImage" },
          { model: PortfolioLike, required: false, as: "Likes" },
          { model: PortfolioComment, required: false, as: "Comments" },
        ],
      }).then((posts) =>
        posts.map((p) => {
          const plain = p.toJSON();
          const { Likes, Comments, ...rest } = plain;
          return {
            ...rest,
            likes_count: Likes ? Likes.length : 0,
            comments_count: Comments ? Comments.length : 0,
          };
        })
      );

      return {
        code: 200,
        message: "Todos os posts",
        posts,
        success: true,
      };
    }

    const posts = await Portfolio.findAll({
      include: [
        { model: PortfolioLike, required: false, as: "Likes" },
        { model: PortfolioComment, required: false, as: "Comments" },
      ],
    }).then((items) =>
      items.map((p) => {
        const plain = p.toJSON();
        const { Likes, Comments, ...rest } = plain;
        return {
          ...rest,
          likes_count: Likes ? Likes.length : 0,
          comments_count: Comments ? Comments.length : 0,
        };
      })
    );
    return {
      code: 200,
      message: "Todos os posts",
      posts,
      success: true,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

module.exports = getAllPostPortfolioService;
