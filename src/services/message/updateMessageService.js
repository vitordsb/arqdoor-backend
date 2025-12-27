const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");

const updateMessageService = async (message_id, messageData, user) => {
  try {
    // Buscar a mensagem pelo ID
    const message = await Message.findByPk(message_id);

    if (!message) {
      return {
        code: 404,
        message: "Mensagem não encontrada",
        success: false,
      };
    }

    // Buscar a conversa para validar se o usuário tem acesso
    const conversation = await Conversation.findByPk(message.conversation_id);

    // Validar se a conversa envolve o usuário logado
    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return {
        code: 403,
        message: "O usuário logado não tem acesso a esta mensagem",
        success: false,
      };
    }

    // Validar se o usuário é o remetente da mensagem
    if (message.sender_id !== user.id) {
      return {
        code: 403,
        message: "Apenas o remetente pode atualizar a mensagem",
        success: false,
      };
    }

    // const moment = require("moment");
    // // validar o tempo maximo para atualizar


    
    // const dateMessage = moment(await message.createdAt);
    // console.log(dateMessage);
    
    // const dateNow = moment(new Date());
    // console.log(dateNow);

    // const diferenca = moment.duration(dateNow.diff(dateMessage));
    // console.log(dateMessage.da);
    
    // console.log(diferenca.hours(), diferenca.minutes());
    // if(dateMessage.day() !== 'Moment<2025-08-03T19:22:34-03:00>'){
    //   console.log("e outro dia");
    // }else {
    //   console.log("e o mesmo dia");
      
    // }
    // Atualizar a mensagem
    // await message.update(messageData);
    // Lógica de atualização será implementada posteriormente

    return {
      code: 200,
      message: "Mensagem atualizada com sucesso",
      data: message,
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = updateMessageService;
