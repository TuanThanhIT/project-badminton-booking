import ApiError from "./ApiError.js";

class InternalServerError extends ApiError {
  constructor(msg = "Lỗi hệ thống vui lòng thử lại sau") {
    super(500, msg);
  }
}

export default InternalServerError;
