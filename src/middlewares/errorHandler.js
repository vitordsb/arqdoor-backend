/**
 * Middleware global de tratamento de erros
 * Captura todos os erros da aplicação e retorna respostas padronizadas
 */

const { AppError } = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  // Log completo do erro no servidor (sempre)
  console.error('❌ Error caught by errorHandler:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Se for um erro operacional (esperado), usar statusCode e mensagem
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.statusCode,
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString()
    });
  }

  // Tratamento de erros específicos do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message).join(', ');
    return res.status(400).json({
      success: false,
      code: 400,
      message: `Erro de validação: ${messages}`,
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return res.status(409).json({
      success: false,
      code: 409,
      message: `Já existe um registro com este ${field}`,
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      code: 400,
      message: 'Operação inválida: registro relacionado não existe',
      timestamp: new Date().toISOString()
    });
  }

  // Tratamento de erros do Multer (upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Arquivo excede o tamanho máximo permitido de 10MB',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(400).json({
      success: false,
      code: 400,
      message: `Erro no upload: ${err.message}`,
      timestamp: new Date().toISOString()
    });
  }

  // Tratamento de erros de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      code: 401,
      message: 'Token inválido',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: 401,
      message: 'Token expirado',
      timestamp: new Date().toISOString()
    });
  }

  // Erro não esperado (programação)
  // Em produção, não expor detalhes
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;

  return res.status(500).json({
    success: false,
    code: 500,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

module.exports = errorHandler;
