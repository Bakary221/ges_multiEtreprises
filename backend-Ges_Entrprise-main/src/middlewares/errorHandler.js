const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Erreurs Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      errorCode: 'DUPLICATE_ENTRY',
      message: 'Resource already exists',
      details: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      errorCode: 'NOT_FOUND',
      message: 'Resource not found',
    });
  }

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      errorCode: 'VALIDATION_ERROR',
      message: err.details[0].message,
    });
  }

  // Erreurs par défaut
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    errorCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;