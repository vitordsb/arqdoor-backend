const request = require('supertest');
const app = require('../server');
const { User, ServiceProvider, ServiceFreelancer } = require('../models/associations');
const { sequelize } = require('../database/config');
const jwt = require('jsonwebtoken');

describe('ServiceFreelancer Endpoints', () => {
  let providerToken;
  let providerUser;

  beforeAll(async () => {
    // 1. Create a Provider User
    const email = `provider_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Provider User',
        email: email,
        password: 'password123',
        birth: '1990-01-01',
        gender: 'Masculino',
        cpf: '12345678901',
        type: 'prestador', // Important
        termos_aceitos: true
      });

    providerToken = res.body.data.token;
    // Get the user ID from response or DB
    // auth response structure: res.body.data.user.user.id (based on auth.test.js)
    const userId = res.body.data.user.user.id;
    providerUser = await User.findByPk(userId);
  });

  it('should create a new service as a provider', async () => {
    const res = await request(app)
      .post('/servicesfreelancer')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        title: 'Projeto Arquitetônico Residencial',
        description: 'Projeto completo de arquitetura para casas.',
        price: 2500.00
      });

    expect(res.status).toBe(201);
    expect(res.body.serviceFreelancer.title).toBe('Projeto Arquitetônico Residencial');
    expect(Number(res.body.serviceFreelancer.price)).toBe(2500);
    expect(res.body.serviceFreelancer.id_provider).toBeDefined();
  });

  it('should list all public services', async () => {
    const res = await request(app)
      .get('/servicesfreelancer/getall');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.servicesFreelancer)).toBe(true);
    const createdService = res.body.servicesFreelancer.find(s => s.title === 'Projeto Arquitetônico Residencial');
    expect(createdService).toBeDefined();
  });

  it('should fail to create service with invalid data', async () => {
    const res = await request(app)
      .post('/servicesfreelancer')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        title: '', // Empty title
        price: -100 // Negative price
      });

    expect(res.statusCode).toBe(400); // Or 422 depending on validator
  });
});
