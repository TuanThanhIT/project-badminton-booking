import ApiError from "./ApiError.js";

class ValidationError extends ApiError {
  constructor(errors, msg = "Validation failed") {
    super(400, msg, errors);
  }
}

export default ValidationError;
