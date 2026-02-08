const axios = require("axios");

/**
 * Consulta um CNPJ na BrasilAPI
 * @param {string} cnpj - O CNPJ a ser consultado (apenas números ou formatado)
 * @returns {Promise<Object>} - Dados da empresa ou erro
 */
const consultarCNPJ = async (cnpj) => {
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");

    if (cnpjLimpo.length !== 14) {
        throw new Error("CNPJ deve ter 14 dígitos.");
    }

    try {
        const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Erro da API (ex: 404 CNPJ não encontrado)
            if (error.response.status === 404) {
                throw new Error("CNPJ não encontrado na Receita Federal.");
            }
            throw new Error(`Erro ao consultar CNPJ: ${error.response.statusText}`);
        } else if (error.request) {
            // Erro de conexão
            throw new Error("Erro de conexão ao consultar serviço de CNPJ.");
        } else {
            // Outro erro
            throw new Error("Erro interno ao validar CNPJ.");
        }
    }
};

module.exports = consultarCNPJ;
