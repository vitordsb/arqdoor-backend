const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const User = require("../../models/User");

const sendMessageController = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "arqdoor@admin.com.br";
    const targetUserId = req.body?.userId;
    const content = (req.body?.content || "").trim();

    if (!targetUserId || !content) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "userId e content são obrigatórios.",
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
      where: {
        user1_id: adminUser.id,
        user2_id: target.id,
      },
    });

    if (!conversation) {
      conversation = await Conversation.findOne({
        where: {
          user1_id: target.id,
          user2_id: adminUser.id,
        },
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        user1_id: adminUser.id,
        user2_id: target.id,
        is_negotiation: false,
      });
    }

    const msg = await Message.create({
      conversation_id: conversation.conversation_id,
      sender_id: adminUser.id,
      content: content,
    });

    return res.json({
      code: 200,
      success: true,
      message: "Mensagem enviada como ArqDoor-ADM",
      data: {
        conversation_id: conversation.conversation_id,
        message_id: msg.message_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Erro ao enviar mensagem do admin",
    });
  }
};

module.exports = sendMessageController;
