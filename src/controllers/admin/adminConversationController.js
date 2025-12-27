const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const User = require("../../models/User");

const adminConversationController = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "arqdoor@admin.com.br";
    const targetUserId = req.params.userId;

    if (!targetUserId) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "userId é obrigatório",
      });
    }

    const adminUser = await User.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Usuário admin não encontrado no banco. Crie o usuário admin primeiro.",
      });
    }

    const target = await User.findByPk(targetUserId);
    if (!target) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Usuário alvo não encontrado",
      });
    }

    let conversation = await Conversation.findOne({
      where: { user1_id: adminUser.id, user2_id: target.id },
    });
    if (!conversation) {
      conversation = await Conversation.findOne({
        where: { user1_id: target.id, user2_id: adminUser.id },
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        user1_id: adminUser.id,
        user2_id: target.id,
        is_negotiation: false,
      });
    }

    const messages = await Message.findAll({
      where: { conversation_id: conversation.conversation_id },
      order: [["createdAt", "ASC"]],
      attributes: ["message_id", "conversation_id", "sender_id", "content", "createdAt"],
    });

    return res.json({
      code: 200,
      success: true,
      data: {
        conversation_id: conversation.conversation_id,
        messages,
        admin_id: adminUser.id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro ao carregar conversa do admin",
    });
  }
};

module.exports = adminConversationController;
