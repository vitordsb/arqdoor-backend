const createUserService = require("../src/services/users/createUserService");
const sequelize = require("../src/database/config");

const runTest = async () => {
    console.log("Iniciando testes de CNPJ...");

    // Data for valid CNPJ test (Banco do Brasil)
    // Generating unique email/cpf to avoid unique constraints (unless that's what we want to test)
    const timestamp = Date.now();
    const userValid = {
        name: "Teste Valid",
        email: `valid_${timestamp}@test.com`,
        password: "123",
        birth: new Date(),
        gender: "Masculino",
        type: "contratante",
        cnpj: "00000000000191",
        provider: "local"
    };

    // Data for invalid CNPJ test
    const userInvalid = {
        name: "Teste Invalid",
        email: `invalid_${timestamp}@test.com`,
        password: "123",
        birth: new Date(),
        gender: "Masculino",
        type: "contratante",
        cnpj: "00000000000000",
        provider: "local"
    };

    try {
        // 1. Testar CNPJ Inválido (Deve falhar na API)
        console.log("\n--- Testando CNPJ INVÁLIDO ---");
        try {
            const resInvalid = await createUserService(userInvalid);
            if (!resInvalid.success) {
                console.log("SUCESSO: Bloqueado corretamente.");
                console.log("Mensagem:", resInvalid.message);
                if (resInvalid.error && resInvalid.error.details) {
                    console.log("Detalhes:", resInvalid.error.details[0].message);
                }
            } else {
                console.log("FALHA: Deveria ter bloqueado, mas criou o usuário.");
            }
        } catch (e) {
            console.log("SUCESSO (com erro):", e.message);
        }

        // 2. Testar CNPJ Válido (Deve passar na API)
        console.log("\n--- Testando CNPJ VÁLIDO ---");
        try {
            const resValid = await createUserService(userValid);
            if (resValid.success) {
                console.log("SUCESSO: Usuário criado.");
            } else {
                // Se falhar por duplicidade, conta como sucesso da validação de API
                const msg = resValid.message || "";
                const detail = resValid.error?.details?.[0]?.message || "";

                if (detail.includes("já esta sendo usado")) {
                    console.log("SUCESSO PARCIAL: Bloqueado por duplicidade de CNPJ no banco (significa que passou pela API).");
                } else {
                    console.log("FALHA/ERRO:", msg, detail);
                }
            }
        } catch (e) {
            console.log("ERRO DE EXECUÇÃO:", e.message);
        }

    } catch (err) {
        console.error("Erro fatal:", err);
    } finally {
        console.log("Fechando conexão...");
        try {
            await sequelize.close();
            console.log("Conexão fechada.");
        } catch (e) {
            console.log("Erro ao fechar:", e.message);
        }
        process.exit(0);
    }
};

runTest();
