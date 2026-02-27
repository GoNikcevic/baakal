function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) console.error(err.stack);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code || undefined,
  });
}

module.exports = errorHandler;
