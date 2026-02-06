const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error("🔥 ERROR:", {
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id,
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    errors: err.errors || null,
  });
};

export default errorHandler;
