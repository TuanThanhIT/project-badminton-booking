import ApiError from "./ApiError.js";

class NotFoundError extends ApiError {
  constructor(msg = "Resource not found") {
    super(404, msg);
  }
}

export default NotFoundError;
