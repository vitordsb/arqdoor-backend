  module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  verbose: true,
  testTimeout: 30000,
  rootDir: '.',
  testMatch: ['<rootDir>/src/tests/**/*.test.js'],
};
