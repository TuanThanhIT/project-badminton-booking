import ApiError from "./ApiError.js";

class BadRequestError extends ApiError {
  constructor(msg = "Bad request") {
    super(400, msg);
  }
}

export default BadRequestError;
