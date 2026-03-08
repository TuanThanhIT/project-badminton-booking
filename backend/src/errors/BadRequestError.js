import ApiError from "./ApiError.js";

class BadRequestError extends ApiError {
  constructor(msg = "Yêu cầu không hợp lệ") {
    super(400, msg);
  }
}

export default BadRequestError;
