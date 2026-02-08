#!/usr/bin/env node
/* eslint-disable no-console */
const { spawnSync } = require("child_process");

function canRun(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "ignore" });
  return r.status === 0;
}

function resolveComposeCommand() {
  // Prefer `docker compose` (newer) and fall back to `docker-compose` (legacy).
  if (canRun("docker", ["compose", "version"])) {
    return { cmd: "docker", baseArgs: ["compose"] };
  }
  if (canRun("docker-compose", ["version"])) {
    return { cmd: "docker-compose", baseArgs: [] };
  }
  return null;
}

const resolved = resolveComposeCommand();
if (!resolved) {
  console.error(
    "Docker Compose not found. Install Docker Desktop or docker-compose, then try again."
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const r = spawnSync(resolved.cmd, [...resolved.baseArgs, ...args], { stdio: "inherit" });
process.exit(r.status ?? 1);

