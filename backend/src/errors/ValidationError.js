import ApiError from "./ApiError.js";

class ValidationError extends ApiError {
  constructor(errors, msg = "Dữ liệu không hợp lệ") {
    super(400, msg, errors);
  }
}

export default ValidationError;
