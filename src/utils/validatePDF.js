/**
 * Validador robusto de arquivos PDF
 * Verifica assinatura, estrutura, tamanho e integridade
 */

const { PDFDocument } = require('pdf-lib');
const crypto = require('crypto');
const { 
  MAX_PDF_SIZE_BYTES, 
  MAX_PDF_PAGES 
} = require('../constants/validation');
const { ValidationError } = require('../utils/AppError');

/**
 * Valida um arquivo PDF
 * @param {Buffer} buffer - Buffer do arquivo
 * @param {string} originalName - Nome original do arquivo
 * @returns {Promise<{valid: boolean, pageCount: number, hash: string}>}
 * @throws {ValidationError} Se o PDF for inválido
 */
const validatePDF = async (buffer, originalName = 'arquivo') => {
  try {
    // 1. Verificar se o buffer existe e não está vazio
    if (!buffer || buffer.length === 0) {
      throw new ValidationError('Arquivo vazio');
    }

    // 2. Verificar tamanho
    if (buffer.length > MAX_PDF_SIZE_BYTES) {
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
      const maxMB = (MAX_PDF_SIZE_BYTES / (1024 * 1024)).toFixed(0);
      throw new ValidationError(
        `PDF excede tamanho máximo de ${maxMB}MB (arquivo: ${sizeMB}MB)`
      );
    }

    // 3. Verificar assinatura de arquivo PDF (%PDF-)
    const pdfSignature = buffer.slice(0, 5).toString('utf-8');
    if (pdfSignature !== '%PDF-') {
      throw new ValidationError(
        'Arquivo não é um PDF válido (assinatura incorreta)'
      );
    }

    // 4. Tentar carregar o PDF com pdf-lib
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(buffer, {
        ignoreEncryption: true, // Permite PDFs com senha
        throwOnInvalidObject: false // Mais tolerante com PDFs malformados
      });
    } catch (loadError) {
      console.error('[validatePDF] Erro ao carregar PDF:', loadError.message);
      throw new ValidationError(
        `PDF corrompido ou inválido: ${loadError.message}`
      );
    }

    // 5. Verificar número de páginas
    const pageCount = pdfDoc.getPageCount();
    
    if (pageCount === 0) {
      throw new ValidationError('PDF não contém páginas');
    }

    if (pageCount > MAX_PDF_PAGES) {
      throw new ValidationError(
        `PDF excede limite de ${MAX_PDF_PAGES} páginas (arquivo: ${pageCount} páginas)`
      );
    }

    // 6. Gerar hash SHA-256 para integridade
    const hash = crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex');

    console.log(`[validatePDF] ✓ PDF válido: ${originalName} (${pageCount} páginas, ${(buffer.length / 1024).toFixed(2)}KB, hash: ${hash.substring(0, 8)}...)`);

    return {
      valid: true,
      pageCount,
      hash,
      sizeBytes: buffer.length
    };

  } catch (error) {
    // Se já for ValidationError, repassar
    if (error instanceof ValidationError) {
      throw error;
    }

    // Outros erros inesperados
    console.error('[validatePDF] Erro inesperado:', error);
    throw new ValidationError(
      `Erro ao validar PDF: ${error.message}`
    );
  }
};

module.exports = { validatePDF };
