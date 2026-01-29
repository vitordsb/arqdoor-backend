const request = require('supertest');
const app = require('../server');
const { User, Conversation, TicketService } = require('../models/associations');
const { sequelize } = require('../database/config');

describe('Ticket Service (Proposals) Endpoints', () => {
  let providerToken;
  let clientToken;
  let providerId;
  let clientId;
  let conversationId;

  beforeAll(async () => {
    // 1. Create Provider
    const emailProv = `prov_${Date.now()}@test.com`;
    const resProv = await request(app).post('/auth/register').send({
      name: 'Provider Ticket', email: emailProv, password: 'password123',
      birth: '1990-01-01', gender: 'Masculino', cpf: '99988877766', type: 'prestador', termos_aceitos: true
    });
    providerToken = resProv.body.data.token;
    providerId = resProv.body.data.user.user.id;

    // 2. Create Client
    const emailCli = `cli_${Date.now()}@test.com`;
    const resCli = await request(app).post('/auth/register').send({
      name: 'Client Ticket', email: emailCli, password: 'password123',
      birth: '1990-01-01', gender: 'Feminino', cpf: '11122233344', type: 'contratante', termos_aceitos: true
    });
    clientToken = resCli.body.data.token;
    clientId = resCli.body.data.user.user.id;

    // 3. Create Conversation
    // Client starts conversation
    const convRes = await request(app)
      .post('/conversation')
      .set('Authorization', `Bearer ${clientToken}`) // Auth might be required or not? Router says no security on POST /conversation?
      // Wait, routerConversations.js lines 39: createConversationValidator, createConversationController. No authToken middleware? 
      // Let's assume it's public/protected. If public, anyone can create.
      // But usually it should be protected. I'll invoke it without auth first based on router file.
      .send({
        user1_id: clientId, // usually user1 is initiator? or sorted?
        user2_id: providerId
      });
      
      // If 401, I'll add auth. 
      // Based on routerConversations.js view earlier: `router.post("/", createConversationValidator, createConversationController);` - No authToken.
      
      // Expecting conversation object
      if (convRes.body.conversation) {
          conversationId = convRes.body.conversation.conversation_id || convRes.body.conversation.id;
      } else if (convRes.body.id) {
            conversationId = convRes.body.id;
      } else if (convRes.body.conversation_id) {
          conversationId = convRes.body.conversation_id;
      }

      // 4. Force is_negotiation = true (API doesn't allow setting it)
      if (conversationId) {
          await Conversation.update({ is_negotiation: true }, { where: { conversation_id: conversationId } });
      } else {
          console.error('Failed to get conversation ID', convRes.body);
      }
  });

  it('should create a new ticket in conversation', async () => {
    // Provider creates ticket/proposal
    const res = await request(app)
      .post('/ticket')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        conversation_id: conversationId
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/sucesso/i);
    // Depending on controller, might return ticket object
  });

  it('should list tickets for conversation', async () => {
    const res = await request(app)
      .get(`/ticket/conversation/${conversationId}`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.statusCode).toBe(200);
    // Expect array
    const tickets = res.body.tickets || res.body; 
    expect(Array.isArray(tickets)).toBe(true);
    expect(tickets.length).toBeGreaterThan(0);
    expect(tickets[0].conversation_id).toBe(conversationId);
  });
});
