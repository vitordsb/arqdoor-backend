#!/usr/bin/env node
/* eslint-disable no-console */
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

const envTestPath = path.resolve(__dirname, "..", ".env.test");
const envExamplePath = path.resolve(__dirname, "..", ".env.test.example");
const envPath = fs.existsSync(envTestPath) ? envTestPath : envExamplePath;

dotenv.config({ path: envPath });

const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME || "arqdoor_test";

if (!user || !password) {
  console.error(
    `Missing DB_USER/DB_PASSWORD in ${path.basename(envPath)}. Copy .env.test.example to .env.test and adjust values.`
  );
  process.exit(1);
}

const timeoutMs = Number(process.env.MYSQL_WAIT_TIMEOUT_MS || 90_000);
const deadline = Date.now() + timeoutMs;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const conn = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
      });
      await conn.query("SELECT 1");
      await conn.end();
      console.log(`MySQL is ready at ${host}:${port} (db=${database})`);
      process.exit(0);
    } catch (err) {
      lastErr = err;
      // Common during startup: ECONNREFUSED/ETIMEDOUT.
      await sleep(1000);
    }
  }

  console.error(`MySQL was not ready after ${timeoutMs}ms (host=${host} port=${port}).`);
  if (lastErr) console.error(lastErr);
  process.exit(1);
})();
