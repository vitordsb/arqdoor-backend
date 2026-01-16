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

  test('INF-05: Deve sincronizar os modelos com o banco de dados com sucesso', async () => {
    try {
      // Forçamos o teste a esperar a sincronização
      await sequelize.sync({ alter: false });
      expect(true).toBe(true);
    } catch (error) {
      throw new Error('Falha na sincronização: ' + error.message);
    }
  });

  test('INF-06: Deve garantir que a pasta de uploads existe', () => {
    const fs = require('fs');
    const path = require('path');
    const uploadsPath = path.join(__dirname, '../uploads');
    expect(fs.existsSync(uploadsPath)).toBe(true);
  });

  test('INF-07: Deve garantir a existência do usuário Admin após a sincronização', async () => {
    const User = require('../src/models/User');
    // O e-mail abaixo deve ser o mesmo que o server.js tenta criar
    const admin = await User.findOne({ where: { email: 'arqdoor@admin.com.br' } });
    expect(admin).not.toBeNull();
    expect(admin.name).toBe('ArqDoor ADM');
  });

  test('INF-08: Deve garantir isolamento do ambiente (uso exclusivo do banco de testes)', () => {
    // Verificamos se o nome do banco na configuração do Sequelize é o de teste
    const dbName = sequelize.config.database;
    expect(dbName).toBe('arqdoor_test');
    
    // Verificamos se o NODE_ENV está setado como 'test'
    expect(process.env.NODE_ENV).toBe('test');
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