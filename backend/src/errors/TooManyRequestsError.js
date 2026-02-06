import ApiError from "./ApiError.js";

class TooManyRequestsError extends ApiError {
  constructor(msg = "Too many requests") {
    super(429, msg);
  }
}

export default TooManyRequestsError;
