/**
 * Constantes de validação compartilhadas entre frontend e backend
 * Centraliza regras de negócio para manter consistência
 */

module.exports = {
  // Validações de Step
  STEP_MIN_PRICE: 5.00,
  STEP_MAX_PRICE: 1000000.00,
  STEP_TITLE_MIN_LENGTH: 3,
  STEP_TITLE_MAX_LENGTH: 255,
  
  // Validações de Senha
  PASSWORD_MIN_LENGTH: 8,
  
  // Limites de Sistema
  MAX_STEPS_PER_TICKET: 50,
  MAX_PDF_SIZE_MB: 10,
  MAX_PDF_SIZE_BYTES: 10 * 1024 * 1024, // 10MB em bytes
  MAX_PDF_PAGES: 100,
  
  // Cache TTL (em segundos)
  CACHE_TTL_SHORT: 60,        // 1 minuto
  CACHE_TTL_MEDIUM: 300,      // 5 minutos
  CACHE_TTL_LONG: 3600,       // 1 hora
};
