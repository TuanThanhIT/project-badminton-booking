import ApiError from "./ApiError.js";

class ConflictError extends ApiError {
  constructor(msg = "Dữ liệu đã tồn tại") {
    super(409, msg);
  }
}

export default ConflictError;
