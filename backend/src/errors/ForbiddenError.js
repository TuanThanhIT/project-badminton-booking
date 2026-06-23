import ApiError from "./ApiError.js";

class ForbiddenError extends ApiError {
  constructor(msg, data = null) {
    super(403, msg || "Forbidden", null, data);
  }
}

export default ForbiddenError;
