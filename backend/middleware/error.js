const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};

module.exports = errorHandler;