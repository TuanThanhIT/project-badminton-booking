import ApiError from "./ApiError.js";

class NotFoundError extends ApiError {
  constructor(msg = "Không tìm thấy tài nguyên") {
    super(404, msg);
  }
}

export default NotFoundError;
