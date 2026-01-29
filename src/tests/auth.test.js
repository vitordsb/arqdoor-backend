const request = require('supertest');
const app = require('../server'); // Assuming server.js exports app
const { User } = require('../models/associations');
const sequelize = require('../database/config');

// Helper to create a user payload
const userPayload = {
  name: 'Auth Test User',
  email: 'auth_test@example.com',
  password: 'strongpassword123',
  birth: '1995-05-05',
  gender: 'Masculino',
  type: 'contratante'
};

describe('Auth Endpoints', () => {
  // Database is cleared by setup.js beforeAll, but we might want to clear specific tables or ensuring clean state
  
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(userPayload);
    
    expect(res.status).toBe(201);
    // Structure: res.body.data.user.user is the user object
    expect(res.body.data.user.user).toHaveProperty('id');
    expect(res.body.data.user.user.email).toBe(userPayload.email);
  });

  it('should fail to register with existing email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(userPayload);
    
    // API returns 409 for existing email
    expect(res.status).toBe(409); 
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: userPayload.email,
        password: userPayload.password
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: userPayload.email,
        password: 'wrongpassword'
      });
    
    // API returns 401 for invalid credentials
    expect(res.status).toBe(401);
  });
});
