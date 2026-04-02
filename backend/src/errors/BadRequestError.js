import ApiError from "./ApiError.js";

class BadRequestError extends ApiError {
  constructor(msg = "Yêu cầu không hợp lệ", data = null) {
    super(400, msg, data);
  }
}

export default BadRequestError;
