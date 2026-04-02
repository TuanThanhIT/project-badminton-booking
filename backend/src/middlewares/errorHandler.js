const errorHandler = (err, req, res, next) => {
  console.log("error>>", err);
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  // Log luôn (nhưng phân biệt mức độ)
  if (isOperational) {
    console.warn("⚠️ >OPERATIONAL ERROR:", err.message);
  } else {
    console.error("💥 >SYSTEM ERROR:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user?.id,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational
      ? err.message
      : "Lỗi hệ thống. Vui lòng thử lại sau.",
    errors: isOperational ? err.errors || null : null,
    ...(err.data && err.data),
  });
};

export default errorHandler;
