import ApiError from "./ApiError.js";

class UnauthorizedError extends ApiError {
  constructor(msg = "Unauthorized") {
    super(401, msg);
  }
}

export default UnauthorizedError;
