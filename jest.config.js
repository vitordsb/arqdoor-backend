module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  verbose: true,
  testTimeout: 30000,
  // Integration tests share a single DB schema; run serially to avoid race conditions.
  maxWorkers: 1,
  rootDir: '.',
  testMatch: ['<rootDir>/src/tests/**/*.test.js'],
};
