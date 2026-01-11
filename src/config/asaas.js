const axios = require("axios");

const DEFAULT_TIMEOUT = 15000;
// produção: "https://www.asaas.com/api/v3"
// sandbox para testes: "https://sandbox.asaas.com/api/v3"

const PROD_BASE_URL = "https://www.asaas.com/api/v3";
const SANDBOX_BASE_URL = "https://sandbox.asaas.com/api/v3";
const normalizeBaseUrl = (value) => (value ? value.replace(/\/+$/, "") : value);
const envBaseUrl = process.env.ASAAS_BASE_URL || process.env.ASAAS_API_URL;
const apiKey = process.env.ASAAS_API_KEY || "";
const isProdKey = apiKey.toLowerCase().includes("_prod_");
const resolvedBaseUrl = normalizeBaseUrl(envBaseUrl) || (isProdKey ? PROD_BASE_URL : SANDBOX_BASE_URL);

if (envBaseUrl && apiKey) {
  const normalizedEnv = normalizeBaseUrl(envBaseUrl);
  const isSandboxUrl = normalizedEnv?.includes("sandbox");
  if (isProdKey && isSandboxUrl) {
    console.warn(
      "ASAAS_API_KEY de produção com base sandbox. Defina ASAAS_BASE_URL para produção ou troque a chave."
    );
  }
  if (!isProdKey && !isSandboxUrl) {
    console.warn(
      "ASAAS_API_KEY de sandbox com base produção. Defina ASAAS_BASE_URL para sandbox ou troque a chave."
    );
  }
}

const asaasClient = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: Number(process.env.ASAAS_TIMEOUT_MS) || DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

asaasClient.interceptors.request.use((config) => {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ASAAS_API_KEY não configurado. Defina a variável de ambiente para usar a integração."
    );
  }

  config.headers["access_token"] = apiKey;
  config.headers["User-Agent"] =
    process.env.ASAAS_USER_AGENT || "ArqDoorApp-Payments";

  return config;
});

module.exports = asaasClient;
