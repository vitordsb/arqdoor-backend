// MOCKS
const mocks = {
    transaction: { rollback: () => { }, commit: () => { } },
    TicketService: { findByPk: null }, // set in test
    Conversation: { findByPk: null },
    ServiceProvider: { findOne: null },
    AdditionalPayment: { create: null, findByPk: null },
    Payment: { create: null },
    User: { findByPk: async (id) => ({ id, name: "User Test", cpf: "123654", email: "test@test.com", phone: "11999999999" }) },
    PaymentCustomer: { findOne: async () => ({ asaas_customer_id: "cus_123" }) },
    asaas: { post: () => ({ data: { id: 'pay_123', status: 'PENDING', invoiceUrl: 'http://url' } }), get: () => ({ data: {} }) }
};

const path = require('path');
const Module = require('module');
const originalRequire = Module.prototype.require;

// Helper to normalize paths for comparison
const isModel = (reqPath, modelName) => reqPath.includes(`models/${modelName}`) || reqPath.endsWith(`/${modelName}`);

Module.prototype.require = function (requestPath) {
    if (requestPath.includes("database/config")) return {
        transaction: async () => mocks.transaction,
        define: () => ({ belongsTo: () => { }, hasOne: () => { }, belongsToMany: () => { }, addHook: () => { } })
    };

    if (isModel(requestPath, "TicketService")) return { findByPk: mocks.TicketService.findByPk };
    if (isModel(requestPath, "Conversation")) return { findByPk: mocks.Conversation.findByPk };
    if (isModel(requestPath, "ServiceProvider")) return { findOne: mocks.ServiceProvider.findOne };
    if (isModel(requestPath, "AdditionalPayment")) return mocks.AdditionalPayment;
    if (isModel(requestPath, "Payment")) return mocks.Payment;
    if (isModel(requestPath, "User")) return mocks.User;
    if (isModel(requestPath, "PaymentCustomer")) return mocks.PaymentCustomer;

    if (requestPath.includes("config/asaas")) return mocks.asaas;

    return originalRequire.apply(this, arguments);
};

// ... Rest of the test remains the same ...
// LOAD SERVICES
// Force reload to apply require mocks
try {
    const servicesToReload = [
        "../src/services/payment/createAdditionalPaymentService",
        "../src/services/payment/respondAdditionalPaymentService",
        "../src/services/payment/ensureAsaasCustomerService"
    ];

    servicesToReload.forEach(s => {
        const resolved = require.resolve(s);
        delete require.cache[resolved];
    });
} catch (e) {
    console.log("Cache clearing error (ignorable):", e.message);
}

const createService = require("../src/services/payment/createAdditionalPaymentService");
const respondService = require("../src/services/payment/respondAdditionalPaymentService");

async function runTests() {
    console.log("--- TESTANDO LÓGICA DE PAGAMENTO ADICIONAL ---");

    const providerUser = { id: 10, type: "prestador" };
    const clientUser = { id: 20, type: "contratante" };

    // SETUP HAPPY PATH DATA
    mocks.TicketService.findByPk = async () => ({ id: 100, provider_id: 500, status: "em andamento", conversation_id: 99 });
    mocks.Conversation.findByPk = async () => ({ id: 99, user1_id: 10, user2_id: 20 });
    mocks.ServiceProvider.findOne = async () => ({ provider_id: 500 });

    mocks.AdditionalPayment.create = async (data) => ({ id: 1, ...data });
    mocks.AdditionalPayment.findByPk = async () => ({
        id: 1, ticket_id: 100, provider_id: 500, contractor_id: 20,
        amount: 50, status: "PENDING", title: "Extra",
        update: async function (d) { Object.assign(this, d); }
    });
    mocks.Payment.create = async (data) => ({ id: 777, ...data });

    // TEST 1: CREATE (Provider)
    console.log("\n1. Criar Cobrança (Prestador Correto)");
    const resCreate = await createService({
        ticket_id: 100, title: "Taxa Extra", description: "Esqueci", amount: 50
    }, providerUser);

    if (resCreate.success) console.log("✅ Sucesso");
    else console.log("❌ Falha:", resCreate.message);

    // TEST 2: CREATE (Wrong User)
    console.log("\n2. Criar Cobrança (Usuário Errado)");
    mocks.ServiceProvider.findOne = async () => null; // Simulate wrong provider
    const resCreateFail = await createService({
        ticket_id: 100, title: "Taxa Extra", description: "Esqueci", amount: 50
    }, { id: 999 });

    if (!resCreateFail.success) console.log("✅ Bloqueado corretamente:", resCreateFail.message);
    else console.log("❌ Deveria ter falhado");

    // Revert Mock
    mocks.ServiceProvider.findOne = async () => ({ provider_id: 500 });

    // TEST 3: RESPOND (Client Accepts)
    console.log("\n3. Cliente Aceita Cobrança");
    const resAccept = await respondService(1, "accept", { method: "PIX" }, clientUser);

    if (resAccept.success && resAccept.data.additional_payment.status === "ACCEPTED") {
        console.log("✅ Sucesso: Status ACCEPTED e Pagamento Gerado");
    } else {
        console.log("❌ Falha:", resAccept.message);
    }

    // TEST 4: RESPOND (Wrong User)
    console.log("\n4. Prestador tenta aceitar (Bloqueio)");
    mocks.AdditionalPayment.findByPk = async () => ({
        id: 1, ticket_id: 100, provider_id: 500, contractor_id: 20,
        amount: 50, status: "PENDING",
        update: () => { }
    });
    const resBlock = await respondService(1, "accept", { method: "PIX" }, providerUser);
    if (!resBlock.success) console.log("✅ Bloqueado corretamente");
    else console.log("❌ Falha: Prestador não deveria aceitar");

}

runTests();
