const sequelize = require('../database/config');
const { User } = require('../models/associations');

describe('Database Connection', () => {
  it('should authenticate successfully', async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });

  it('should allow creating a user', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      birth: '1990-01-01',
      gender: 'Prefiro não dizer',
      type: 'contratante'
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
