class SuccessResponse {
  constructor(message = "Success", data = null) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export default SuccessResponse;
