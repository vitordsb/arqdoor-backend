const AdditionalPayment = require("../../models/AdditionalPayment");
const TicketService = require("../../models/TicketService");
const Conversation = require("../../models/Conversation");
const User = require("../../models/User");

const createAdditionalPaymentService = async (data, user) => {
    try {
        const { ticket_id, title, description, amount } = data;

        if (!ticket_id || !title || !description || !amount) {
            return {
                code: 400,
                message: "Todos os campos (ticket_id, title, description, amount) são obrigatórios.",
                success: false,
            };
        }

        const ticket = await TicketService.findByPk(ticket_id);
        if (!ticket) {
            return { code: 404, message: "Contrato não encontrado.", success: false };
        }

        // Verificar se o usuário é o PRESTADOR deste contrato
        if (ticket.provider_id !== user.provider_id && user.type !== "admin") { // Assuming user has provider_id if type is provider, logic check below
            // Actually user object usually has id, type. ProviderId comes from ServiceProvider lookup.
            // Let's rely on logic: User must be part of the conversation as PROVIDER.
            // But better: check against ticket.provider_id.
            // We need to know the User's provider_id. 
            // Typically req.user contains { id, type, ... }. 
        }

        // Validate User Permission (Must be the Provider of the Ticket)
        // We can check Conversation too.
        const conversation = await Conversation.findByPk(ticket.conversation_id);
        if (!conversation) {
            return { code: 404, message: "Conversa não encontrada.", success: false };
        }

        // Identify who is who
        // The requester must be the ServiceProvider linked to this ticket.
        // We can fetch ServiceProvider by user_id to confirm.
        const ServiceProvider = require("../../models/ServiceProvider");
        const provider = await ServiceProvider.findOne({ where: { user_id: user.id } });

        if (!provider || provider.provider_id !== ticket.provider_id) {
            return {
                code: 403,
                message: "Apenas o prestador responsável pelo contrato pode gerar cobranças adicionais.",
                success: false
            };
        }

        // Validate functionality constraints: Ticket must be "em andamento"
        if (ticket.status !== "em andamento") {
            return {
                code: 400,
                message: "Cobranças adicionais só podem ser geradas para contratos em andamento.",
                success: false
            };
        }

        const value = Number(amount);
        if (isNaN(value) || value < 5) {
            return { code: 400, message: "O valor deve ser no mínimo R$ 5,00.", success: false };
        }

        // Find the contractor (client) ID from the conversation
        // In Conversation: user1_id and user2_id. One is provider, one is contractor.
        // ticket.provider_id is known. user.id is the provider.
        // The OTHER user in conversation is the contractor.
        const contractorId = (conversation.user1_id === user.id) ? conversation.user2_id : conversation.user1_id;

        const additionalPayment = await AdditionalPayment.create({
            ticket_id,
            provider_id: ticket.provider_id,
            contractor_id: contractorId,
            title,
            description,
            amount: value,
            status: "PENDING",
        });

        return {
            code: 201,
            message: "Cobrança adicional criada com sucesso.",
            data: additionalPayment,
            success: true,
        };

    } catch (error) {
        console.error("Erro em createAdditionalPaymentService:", error);
        return {
            code: 500,
            message: "Erro interno ao criar cobrança adicional.",
            success: false,
        };
    }
};

module.exports = createAdditionalPaymentService;
