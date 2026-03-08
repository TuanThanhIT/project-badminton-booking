import ApiError from "./ApiError.js";

class UnauthorizedError extends ApiError {
  constructor(msg = "Bạn chưa đăng nhập") {
    super(401, msg);
  }
}

export default UnauthorizedError;
