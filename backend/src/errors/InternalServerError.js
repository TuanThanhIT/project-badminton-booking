import ApiError from "./ApiError.js";

class InternalServerError extends ApiError {
  constructor(msg = "Internal server error") {
    super(500, msg);
  }
}

export default InternalServerError;
