/**
 * Serviço de cache centralizado usando node-cache
 * Gerencia cache em memória com TTL configurável
 */

const NodeCache = require('node-cache');

// Criar instância do cache
const cache = new NodeCache({
  stdTTL: 300, // TTL padrão: 5 minutos
  checkperiod: 60, // Verificar expiração a cada 60 segundos
  useClones: false // Melhor performance, mas cuidado com mutações
});

const cacheService = {
  /**
   * Buscar valor do cache
   * @param {string} key - Chave do cache
   * @returns {any|undefined} Valor ou undefined se não existir
   */
  get(key) {
    const value = cache.get(key);
    if (value !== undefined) {
      console.log(`[Cache] HIT: ${key}`);
    } else {
      console.log(`[Cache] MISS: ${key}`);
    }
    return value;
  },

  /**
   * Salvar valor no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - TTL em segundos (opcional)
   * @returns {boolean} Sucesso da operação
   */
  set(key, value, ttl) {
    const success = cache.set(key, value, ttl);
    console.log(`[Cache] SET: ${key} (TTL: ${ttl || 'default'}s)`);
    return success;
  },

  /**
   * Remover chave específica do cache
   * @param {string} key - Chave a ser removida
   * @returns {number} Número de chaves removidas
   */
  del(key) {
    const deleted = cache.del(key);
    if (deleted > 0) {
      console.log(`[Cache] DEL: ${key}`);
    }
    return deleted;
  },

  /**
   * Remover todas as chaves que começam com um prefixo
   * Útil para invalidar cache relacionado (ex: todos os tickets de uma conversa)
   * @param {string} prefix - Prefixo das chaves
   * @returns {number} Número de chaves removidas
   */
  delStartWith(prefix) {
    const keys = cache.keys().filter(k => k.startsWith(prefix));
    const deleted = cache.del(keys);
    if (deleted > 0) {
      console.log(`[Cache] DEL_PREFIX: ${prefix} (${deleted} keys)`);
    }
    return deleted;
  },

  /**
   * Limpar todo o cache
   */
  flush() {
    cache.flushAll();
    console.log('[Cache] FLUSH: All keys cleared');
  },

  /**
   * Obter estatísticas do cache
   * @returns {object} Estatísticas
   */
  getStats() {
    return cache.getStats();
  },

  /**
   * Verificar se uma chave existe
   * @param {string} key - Chave a verificar
   * @returns {boolean}
   */
  has(key) {
    return cache.has(key);
  }
};

// Log de inicialização
console.log('[Cache] Service initialized with default TTL: 300s');

module.exports = cacheService;
