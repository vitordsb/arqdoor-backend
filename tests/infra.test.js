const request = require('supertest');
const app = require('../src/server'); 
const sequelize = require('../src/database/config');

describe('Fase 1: Testes de Infraestrutura', () => {
  
  // Teste INF-01: Conexão com o Banco de Dados
  test('INF-01: Deve conectar ao banco de dados arqdoor_test com sucesso', async () => {
    try {
      await sequelize.authenticate();
      expect(true).toBe(true); 
    } catch (error) {
      throw new Error('Falha na conexão com o banco: ' + error.message);
    }
  });

  // Teste INF-03: Rota de Documentação
  test('INF-03: Deve carregar a rota de documentação /doc', async () => {
    const response = await request(app).get('/doc');
    // Aceita 200 (sucesso) ou 301/302 (redirecionamento do Swagger)
    expect([200, 301, 302]).toContain(response.status);
  });

  // Teste INF-04: Segurança do Webhook de Deploy
  test('INF-04: Deve negar acesso à rota /deploy sem token', async () => {
    const response = await request(app).post('/webhook/deploy');
    expect(response.status).toBe(403);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});