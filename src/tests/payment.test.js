const createGroupedPaymentService = require('../services/payment/createGroupedPaymentService');
const asaasClient = require('../config/asaas');
const { User, TicketService, Step, Payment, PaymentStep, ServiceProvider, PaymentGroup, Conversation } = require('../models/associations');
const sequelize = require('../database/config');

// Mock Asaas only
jest.mock('../config/asaas');
jest.mock('../services/payment/ensureAsaasCustomerService', () => {
    return jest.fn().mockResolvedValue({ asaas_customer_id: 'cus_mock_123' });
});

describe('createGroupedPaymentService Integration', () => {
    let contractor, provider, ticket, step1, step2, group;

    beforeEach(async () => {
        // Clear DB is handled by setup.js?? 
        // setup.js runs beforeAll. Here we manually clean or rely on transactions?
        // Let's clean manually to be safe or use force: true in setup.js (which we did).
        // For iteration safety, we can destroy.
        await PaymentStep.destroy({ where: {}, force: true });
        await Payment.destroy({ where: {}, force: true });
        await Step.destroy({ where: {}, force: true });
        await TicketService.destroy({ where: {}, force: true });
        await ServiceProvider.destroy({ where: {}, force: true });
        await User.destroy({ where: {}, force: true });
        
        // Create Contractor
        contractor = await User.create({
            name: 'Contractor User',
            email: 'contractor@test.com',
            password: 'pass',
            birth: '1990-01-01',
            gender: 'Masculino',
            type: 'contratante'
        });

        // Create Provider User & Profile
        const providerUser = await User.create({
            name: 'Provider User',
            email: 'provider@test.com',
            password: 'pass',
            birth: '1990-01-01',
            gender: 'Masculino',
            type: 'prestador'
        });
        provider = await ServiceProvider.create({
            user_id: providerUser.id,
            profession: 'Dev'
        });

        // Create Conversation
        const conversation = await Conversation.create({
            user1_id: contractor.id,
            user2_id: providerUser.id,
            is_negotiation: true
        });

        if (!provider) throw new Error('Provider creation failed');
        console.log('Provider ID:', provider.provider_id);

        // Create Ticket
        ticket = await TicketService.create({
            title: 'Test Ticket',
            description: 'Desc',
            value: 200,
            allow_grouped_payment: true,
            provider_id: provider.provider_id, // Use correct PK
            conversation_id: conversation.conversation_id, 
            payment_preference: 'per_step', // or 'custom'
            status: 'pendente' // Valid enum value
        });

        // Create Group (if needed logic uses it)
        group = await PaymentGroup.create({
            ticket_id: ticket.id,
            name: 'Group 1', // Correct field name
            percentage: 100,
            order: 1
        });

        // Create Steps
        step1 = await Step.create({
            ticket_id: ticket.id,
            title: 'Step 1',
            price: 100,
            // order: 1, // Removed as not in model
            status: 'Pendente',
            group_id: group.id,
            confirm_freelancer: true,
            confirm_contractor: true,
            is_financially_cleared: false
        });

        step2 = await Step.create({
            ticket_id: ticket.id,
            title: 'Step 2',
            price: 50,
            // order: 2, // Removed as not in model
            status: 'Pendente',
            group_id: group.id,
            confirm_freelancer: true,
            confirm_contractor: true,
            is_financially_cleared: false
        });

        // Reset mocks
        jest.clearAllMocks();
        asaasClient.post.mockResolvedValue({
            data: {
                id: 'pay_asaas_123',
                status: 'PENDING',
                invoiceUrl: 'url',
                pixQrCodeField: 'pix',
                bankSlipUrl: 'boleto'
            }
        });
        asaasClient.get.mockResolvedValue({ data: { payload: 'pix', encodedImage: 'img' } });
    });

    it('should set billingType to UNDEFINED for CREDIT_CARD', async () => {
        const stepIds = [step1.id, step2.id];
        
        const result = await createGroupedPaymentService(stepIds, contractor, { method: 'CREDIT_CARD' });
        
        if (!result.success) {
            console.error('Service Error:', result);
        }

        expect(result.success).toBe(true);
        expect(result.code).toBe(201);

        // Verify Asaas Call
        expect(asaasClient.post).toHaveBeenCalledTimes(1);
        const callArgs = asaasClient.post.mock.calls[0];
        expect(callArgs[0]).toBe('/payments');
        expect(callArgs[1]).toEqual(expect.objectContaining({
            billingType: 'UNDEFINED',
            value: 150 // 100 + 50
        }));
    });
});
