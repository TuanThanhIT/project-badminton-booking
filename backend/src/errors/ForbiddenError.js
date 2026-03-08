import ApiError from "./ApiError.js";

class ForbiddenError extends ApiError {
  constructor(msg = "Bạn không có quyền truy cập") {
    super(403, msg);
  }
}

export default ForbiddenError;
