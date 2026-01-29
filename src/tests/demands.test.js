const request = require('supertest');
const app = require('../server');
const { User, Demand } = require('../models/associations');
const { sequelize } = require('../database/config');

describe('Demand Endpoints', () => {
  let clientToken;
  let clientUser;

  beforeAll(async () => {
    // 1. Create a Client User (contratante)
    const email = `client_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Client User',
        email: email,
        password: 'password123',
        birth: '1995-05-05',
        gender: 'Feminino',
        cpf: '10987654321', // Different CPF from provider
        type: 'contratante', // Important
        termos_aceitos: true
      });

    clientToken = res.body.data.token;
    const userId = res.body.data.user.user.id;
    clientUser = await User.findByPk(userId);
  });

  it('should create a new demand as a client', async () => {
    const res = await request(app)
      .post('/demands')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Preciso de reforma na sala',
        description: 'Quero mudar o piso e pintar as paredes.',
        price: 5000.00
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.demand).toBeDefined();
    expect(res.body.demand.title).toBe('Preciso de reforma na sala');
    expect(Number(res.body.demand.price)).toBe(5000);
    expect(res.body.demand.status).toBe('pendente');
  });

  it('should list client demands', async () => {
    const res = await request(app)
      .get('/demands')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
    // Check 'demands' or 'demand' property based on service inspection
    const list = res.body.demands || res.body.demand;
    expect(Array.isArray(list)).toBe(true);
    const myDemand = list.find(d => d.title === 'Preciso de reforma na sala');
    expect(myDemand).toBeDefined();
  });

  it('should update demand status', async () => {
    // Get the demand first
    const listRes = await request(app)
      .get('/demands')
      .set('Authorization', `Bearer ${clientToken}`);
    const list = listRes.body.demands || listRes.body.demand;
    const demand = list.find(d => d.title === 'Preciso de reforma na sala');

    const res = await request(app)
      .patch(`/demands/status/${demand.id_demand}`) // Note: id_demand based on model
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        status: 'concluída'
      });

    expect(res.statusCode).toBe(200);
    // Verify update
    const updatedDemand = await Demand.findByPk(demand.id_demand);
    expect(updatedDemand.status).toBe('concluída');
  });
});
