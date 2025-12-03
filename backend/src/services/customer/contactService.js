import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import mailer from "../../utils/mailer.js";

const submitContactService = async (
  fullName,
  email,
  phoneNumber,
  subject,
  message
) => {
  try {
    // Validate email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email?.trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email không hợp lệ!");
    }
    if (!fullName || !message) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Họ tên hoặc nội dung không được để trống!"
      );
    }

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Số điện thoại khách hàng không hợp lệ!"
      );
    }

    await mailer.sendContactMail({
      fullName,
      email,
      phoneNumber,
      subject,
      message,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const contactService = {
  submitContactService,
};
export default contactService;
