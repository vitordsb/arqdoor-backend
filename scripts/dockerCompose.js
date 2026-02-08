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

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8" });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r;
}

function isDockerPermissionError(output) {
  return /permission denied while trying to connect to the Docker daemon socket|Got permission denied while trying to connect to the Docker daemon socket|dial unix .*docker\.sock.*permission denied/i.test(
    output
  );
}

function isDockerDaemonDownError(output) {
  return /Cannot connect to the Docker daemon|Is the docker daemon running\?/i.test(output);
}

const resolved = resolveComposeCommand();
if (!resolved) {
  console.error(
    "Docker Compose not found. Install Docker Desktop or docker-compose, then try again."
  );
  process.exit(1);
}

const rawArgs = process.argv.slice(2);
const wantsSudo = rawArgs.includes("--sudo");
const args = rawArgs.filter((a) => a !== "--sudo");

const base = [resolved.cmd, ...resolved.baseArgs, ...args];
const r = wantsSudo ? run("sudo", base) : run(resolved.cmd, [...resolved.baseArgs, ...args]);
if (r.status === 0) process.exit(0);

const combined = `${r.stdout || ""}\n${r.stderr || ""}`;
if (isDockerPermissionError(combined)) {
  console.error("\nDocker permission error detected.\n");
  console.error("Fix options:");
  console.error("1) Recommended: add your user to the docker group and re-login:");
  console.error("   sudo usermod -aG docker $USER");
  console.error("2) Or run with sudo (will prompt for password):");
  console.error("   npm run test:db:up -- --sudo");
  process.exit(r.status ?? 1);
}
if (isDockerDaemonDownError(combined)) {
  console.error("\nDocker daemon not reachable. Start Docker and try again.\n");
  process.exit(r.status ?? 1);
}

process.exit(r.status ?? 1);
