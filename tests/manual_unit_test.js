// MANUAL MOCKS
const mocks = {
    transaction: {
        rollback: () => console.log("  [Mock] Transaction Rollback"),
        commit: () => console.log("  [Mock] Transaction Commit")
    },
    userFindOne: null, // Will be set in test
    userCreate: null, // Will be set in test
    cnpjService: null, // Will be set in test
    bcryptHash: () => "hashed_password"
};

// OVERRIDE REQUIRE
const originalRequire = require('module').prototype.require;
require('module').prototype.require = function (path) {
    if (path.includes("database/config")) {
        return {
            transaction: async () => mocks.transaction,
            define: () => ({ belongsTo: () => { }, hasOne: () => { } }) // Mock define for models
        };
    }
    if (path.includes("models/User")) {
        return {
            findOne: (...args) => mocks.userFindOne(...args),
            create: (...args) => mocks.userCreate(...args)
        };
    }
    if (path.includes("models/ServiceProvider")) {
        return { create: async () => ({}) };
    }
    if (path.includes("utils/cnpjService")) {
        return (...args) => mocks.cnpjService(...args);
    }
    if (path === "bcryptjs") {
        return { hashSync: mocks.bcryptHash };
    }
    return originalRequire.apply(this, arguments);
};

// LOAD SERVICE (after mocking require)
const createUserService = require("../src/services/users/createUserService");

async function runTests() {
    console.log("--- INICIANDO TESTES MANUAIS (SEM JEST) ---");

    // TEST 1: INVALID CNPJ
    console.log("\nTEST 1: CNPJ Inválido (BrasilAPI retorna erro)");
    mocks.userFindOne = async () => null;
    mocks.cnpjService = async () => { throw new Error("CNPJ não encontrado"); };

    try {
        const res = await createUserService({
            name: "Test", email: "t@t.com", password: "123", cnpj: "00000000000000", type: "contratante"
        });
        if (!res.success && res.message === "Erro na validação do CNPJ") {
            console.log("PASSOU ✅");
        } else {
            console.log("FALHOU ❌", res);
        }
    } catch (e) { console.log("ERRO DE EXECUÇÃO:", e); }

    // TEST 2: INACTIVE CNPJ
    console.log("\nTEST 2: CNPJ Inativo");
    mocks.cnpjService = async () => ({ descricao_situacao_cadastral: "BAIXADA" });

    try {
        const res = await createUserService({
            name: "Test", email: "t@t.com", password: "123", cnpj: "00000000000000", type: "contratante"
        });
        if (!res.success && res.message === "CNPJ inválido ou inativo") {
            console.log("PASSOU ✅");
        } else {
            console.log("FALHOU ❌", res);
        }
    } catch (e) { console.log("ERRO DE EXECUÇÃO:", e); }

    // TEST 3: VALID CNPJ
    console.log("\nTEST 3: CNPJ Válido e Ativo");
    mocks.cnpjService = async () => ({ descricao_situacao_cadastral: "ATIVA" });
    mocks.userCreate = async (data) => ({ id: 1, ...data });

    try {
        const res = await createUserService({
            name: "Test", email: "t@t.com", password: "123", cnpj: "00000000000191", type: "contratante"
        });
        if (res.success) {
            console.log("PASSOU ✅");
        } else {
            console.log("FALHOU ❌", res);
        }
    } catch (e) { console.log("ERRO DE EXECUÇÃO:", e); }
}

runTests();
