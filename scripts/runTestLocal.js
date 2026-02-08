#!/usr/bin/env node
/* eslint-disable no-console */
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: opts.env || process.env,
  });
  if (r.error) throw r.error;
  return r.status ?? 1;
}

function tryResolveJestBin() {
  try {
    return require.resolve("jest/bin/jest.js", { paths: [rootDir] });
  } catch {
    return null;
  }
}

let exitCode = 0;
try {
  exitCode = run("node", ["scripts/dockerCompose.js", "-f", "docker-compose.test.yml", "up", "-d"]);
  if (exitCode !== 0) process.exit(exitCode);

  exitCode = run("node", ["scripts/waitMysql.js"], {
    env: { ...process.env, NODE_ENV: "test" },
  });
  if (exitCode !== 0) process.exit(exitCode);

  const jestBin = tryResolveJestBin();
  if (!jestBin) {
    console.error('Jest not found. Run "npm ci" first.');
    process.exit(1);
  }

  exitCode = run(process.execPath, [jestBin], {
    env: { ...process.env, NODE_ENV: "test" },
  });
} finally {
  // Always tear down the test DB so it doesn't linger (and remove volumes for a clean run).
  const downExit = run("node", ["scripts/dockerCompose.js", "-f", "docker-compose.test.yml", "down", "-v"]);
  if (exitCode === 0 && downExit !== 0) exitCode = downExit;
}

process.exit(exitCode);

