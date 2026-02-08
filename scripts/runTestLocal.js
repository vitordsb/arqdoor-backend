#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
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

function tryFindJestBinPath() {
  // Jest v30+ uses package "exports", so require.resolve("jest/bin/jest.js") can fail even when the file exists.
  const jestBin = path.join(rootDir, "node_modules", "jest", "bin", "jest.js");
  return fs.existsSync(jestBin) ? jestBin : null;
}

let exitCode = 0;
try {
  exitCode = run("node", ["scripts/dockerCompose.js", "-f", "docker-compose.test.yml", "up", "-d"]);

  if (exitCode === 0) {
    exitCode = run("node", ["scripts/waitMysql.js"], {
      env: { ...process.env, NODE_ENV: "test" },
    });
  }

  if (exitCode === 0) {
    const jestBin = tryFindJestBinPath();
    if (!jestBin) {
      console.error('Jest not found. Install devDependencies (e.g. run "npm ci --include=dev").');
      exitCode = 1;
    } else {
      exitCode = run(process.execPath, [jestBin], {
        env: { ...process.env, NODE_ENV: "test" },
      });
    }
  }
} catch (err) {
  if (exitCode === 0) exitCode = 1;
  console.error(err && err.stack ? err.stack : String(err));
} finally {
  // Always tear down the test DB so it doesn't linger (and remove volumes for a clean run).
  try {
    const downExit = run("node", ["scripts/dockerCompose.js", "-f", "docker-compose.test.yml", "down", "-v"]);
    if (exitCode === 0 && downExit !== 0) exitCode = downExit;
  } catch (err) {
    if (exitCode === 0) exitCode = 1;
    console.error(err && err.stack ? err.stack : String(err));
  }
}

process.exit(exitCode);
