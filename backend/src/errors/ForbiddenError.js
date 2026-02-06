import ApiError from "./ApiError.js";

class ForbiddenError extends ApiError {
  constructor(msg = "Access forbidden") {
    super(403, msg);
  }
}

export default ForbiddenError;
