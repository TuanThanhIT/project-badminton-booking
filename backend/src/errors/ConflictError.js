import ApiError from "./ApiError.js";

class ConflictError extends ApiError {
  constructor(msg = "Resource conflict") {
    super(409, msg);
  }
}

export default ConflictError;
