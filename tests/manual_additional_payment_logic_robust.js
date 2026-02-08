// ROBUST TEST RUNNER
// Configurar Mocks ANTES de carregar qualquer coisa

const mocks = {
    TicketService: {
        findByPk: async () => ({ id: 100, provider_id: 500, status: "em andamento", conversation_id: 99 }),
        belongsTo: () => { }
    },
    Conversation: {
        findByPk: async () => ({ id: 99, user1_id: 10, user2_id: 20 }),
        hasMany: () => { }
    },
    ServiceProvider: {
        findOne: async () => ({ provider_id: 500 }),
        belongsTo: () => { }
    },
    AdditionalPayment: {
        create: async (data) => ({ id: 1, ...data }),
        findByPk: async () => ({
            id: 1, ticket_id: 100, provider_id: 500, contractor_id: 20,
            amount: 50, status: "PENDING", title: "Extra",
            update: async function (d) { Object.assign(this, d); },
            contractor_id: 20 // Ensure this matches clientUser.id in test
        }),
        belongsTo: () => { }
    },
    Payment: {
        create: async (data) => ({ id: 777, ...data }),
        belongsTo: () => { }, belongsToMany: () => { }, addHook: () => { }
    },
    User: {
        findByPk: async (id) => ({ id, name: "User Test", cpf: "123654", email: "test@test.com", phone: "11999999999" }),
        hasOne: () => { }
    },
    PaymentCustomer: {
        findOne: async () => ({ asaas_customer_id: "cus_123" }),
        belongsTo: () => { }
    },
    asaas: {
        post: async () => ({ data: { id: 'pay_123', status: 'PENDING', invoiceUrl: 'http://invoice', encodedImage: 'base64', payload: 'copy-paste' } }),
        get: async () => ({ data: { encodedImage: 'base64', payload: 'copy-paste', expirationDate: new Date() } })
    },
    sequelize: {
        define: () => ({ belongsTo: () => { }, hasOne: () => { }, belongsToMany: () => { }, addHook: () => { } }),
        transaction: async () => ({ rollback: () => { }, commit: () => { } })
    }
};

const path = require('path');

// MAPA DE RESOLUÇÃO DE CAMINHOS
// Como os paths são relativos, precisamos ser espertos.
// Vamos usarrequire.cache para "envenenar" o cache com nossos mocks.

const projectRoot = path.resolve(__dirname, "..");
const modelsPath = path.join(projectRoot, "src", "models");
const configPath = path.join(projectRoot, "src", "database", "config.js");
const asaasConfigPath = path.join(projectRoot, "src", "config", "asaas.js");

console.log("--- DEBUG: Injecting Mocks ---");

// Helper para injetar mock no cache
function injectMock(fullPath, mockObj) {
    require.cache[fullPath] = {
        id: fullPath,
        filename: fullPath,
        loaded: true,
        exports: mockObj
    };
}

// Injetar Models
injectMock(path.join(modelsPath, "TicketService.js"), mocks.TicketService);
injectMock(path.join(modelsPath, "Conversation.js"), mocks.Conversation);
injectMock(path.join(modelsPath, "ServiceProvider.js"), mocks.ServiceProvider);
injectMock(path.join(modelsPath, "AdditionalPayment.js"), mocks.AdditionalPayment);
injectMock(path.join(modelsPath, "Payment.js"), mocks.Payment);
injectMock(path.join(modelsPath, "User.js"), mocks.User);
injectMock(path.join(modelsPath, "PaymentCustomer.js"), mocks.PaymentCustomer);

// Injetar Configs
injectMock(configPath, mocks.sequelize);
injectMock(asaasConfigPath, mocks.asaas);

// Injetar dependência circular ou interna se necessário
// Payment requer TicketService, User, ServiceProvider... se o Payment real fosse carregado, ele tentaria carregar esses arquivos reais.
// Como injetamos mocks para TODOS eles, o `require` dentro dos services vai pegar nossos mocks do cache.

console.log("--- Mocks Injected. Loading Services... ---");

// AGORA carregamos os serviços
const createService = require("../src/services/payment/createAdditionalPaymentService");
const respondService = require("../src/services/payment/respondAdditionalPaymentService");

async function runTests() {
    console.log("--- TESTANDO LÓGICA DE PAGAMENTO ADICIONAL ---");

    const providerUser = { id: 10, type: "prestador" };
    const clientUser = { id: 20, type: "contratante" }; // Matches contractor_id in AdditionalPayment mock

    // TEST 1: CREATE (Provider)
    console.log("\n1. Criar Cobrança (Prestador Correto)");
    try {
        const resCreate = await createService({
            ticket_id: 100, title: "Taxa Extra", description: "Esqueci", amount: 50
        }, providerUser);

        if (resCreate.success) console.log("✅ Sucesso");
        else console.log("❌ Falha:", resCreate.message);
    } catch (e) { console.log("❌ CRASH:", e); }

    // TEST 2: CREATE (Wrong User)
    console.log("\n2. Criar Cobrança (Usuário Errado)");
    // Dynamic Mock Update isn't easy with Simple Mock Objects. 
    // We update the method implementation directly.
    const originalFindOne = mocks.ServiceProvider.findOne;
    mocks.ServiceProvider.findOne = async () => null;

    try {
        const resCreateFail = await createService({
            ticket_id: 100, title: "Taxa Extra", description: "Esqueci", amount: 50
        }, { id: 999 });

        if (!resCreateFail.success) console.log("✅ Bloqueado corretamente:", resCreateFail.message);
        else console.log("❌ Deveria ter falhado");
    } catch (e) { console.log("❌ CRASH:", e); }

    mocks.ServiceProvider.findOne = originalFindOne; // Restore

    // TEST 3: RESPOND (Client Accepts)
    console.log("\n3. Cliente Aceita Cobrança");
    try {
        const resAccept = await respondService(1, "accept", { method: "PIX" }, clientUser);

        if (resAccept.success && resAccept.data.additional_payment.status === "ACCEPTED") {
            console.log("✅ Sucesso: Status ACCEPTED e Pagamento Gerado");
        } else {
            console.log("❌ Falha:", resAccept.message);
        }
    } catch (e) { console.log("❌ CRASH:", e); }

    // TEST 4: RESPOND (Wrong User)
    console.log("\n4. Prestador tenta aceitar (Bloqueio)");
    try {
        const resBlock = await respondService(1, "accept", { method: "PIX" }, providerUser);
        if (!resBlock.success) console.log("✅ Bloqueado corretamente");
        else console.log("❌ Falha: Prestador não deveria aceitar");
    } catch (e) { console.log("❌ CRASH:", e); }

}

runTests();
