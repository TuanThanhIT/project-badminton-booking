class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; //isOperational giúp backend biết: “Lỗi này có phải lỗi mình đã lường trước hay là bug chết người?”
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;

// 🔹 super() tạo ra this
// 🔹 Class cha xây móng
// 🔹 Class con xây tầng trên
// Trong constructor của class con (extends)
// BẮT BUỘC phải gọi super() trước khi dùng this
