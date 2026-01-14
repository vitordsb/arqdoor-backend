const request = require('supertest');
const app = require('../src/server');
const sequelize = require('../src/database/config');
const User = require('../src/models/User');

// Aumentamos o tempo para o banco respirar
jest.setTimeout(30000);

describe('Fase 2: Testes de Identidade e Autenticação', () => {
  
  beforeAll(async () => {
    await sequelize.sync(); 
    await User.destroy({ where: { email: 'testador@teste.com' } });
  });

  // --- TESTE ID-01 ---
  test('ID-01: Deve cadastrar um novo usuário com sucesso', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Testador Silva',
        email: 'testador@teste.com',
        password: 'SenhaSegura123',
        birth: '1995-05-20',
        gender: 'Masculino',
        type: 'contratante',
        termos_aceitos: true
      });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  // --- TESTE ID-02 ---
  test('ID-02: Deve impedir e-mail duplicado (Conflito)', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Outro Nome',
        email: 'testador@teste.com', 
        password: 'SenhaSegura123', // Senha agora tem + de 6 caracteres
        birth: '1990-01-01',
        gender: 'Feminino',
        type: 'prestador'
      });
    // Agora vai passar pelo validador e retornar 409 (Conflito no Banco)
    expect(response.status).toBe(409); 
  });

  // --- TESTE ID-03 ---
  test('ID-03: Deve realizar login e retornar Token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'testador@teste.com', password: 'SenhaSegura123' });
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('token');
  });

  // --- TESTE ID-04 ---
  test('ID-04: Deve negar login com senha incorreta', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'testador@teste.com', password: 'SENHA_ERRADA' });
    expect(response.status).toBe(401);
  });

  // --- TESTE ID-05 ---
  test('ID-05: Deve validar campos obrigatórios', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'Incompleto' });
    expect(response.status).toBe(400);
  });
});