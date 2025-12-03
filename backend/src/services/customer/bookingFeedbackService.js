import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Booking,
  User,
  Court,
  BookingFeedback,
  Profile,
} from "../../models/index.js";

const createBookingFeedbackService = async (
  content,
  rate,
  userId,
  bookingId,
  courtId
) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }
    const rating = Number(rate);
    if (Number.isInteger(rating) === false) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Sao đánh giá phải là số nguyên!"
      );
    } else if (rating < 1 || rating > 5) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Sao đánh giá không hợp lệ!");
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    } else {
      if (booking.bookingStatus !== "Completed") {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Đặt sân chưa thành công! Bạn không thể đánh giá sân này được!"
        );
      }
    }

    const court = await Court.findByPk(courtId);
    if (!court) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sân này không tồn tại!");
    }

    await BookingFeedback.create({
      content,
      rating,
      userId,
      bookingId,
      courtId,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getBookingFeedbackUpdateService = async (bookingId, userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }

    const bookingFeedback = await BookingFeedback.findOne({
      where: { userId, bookingId },
    });

    if (!bookingFeedback) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Đánh giá cho sân không tồn tại!"
      );
    }

    const boFeedback = {
      content: bookingFeedback.content,
      rating: bookingFeedback.rating,
      updatedDate: bookingFeedback.updatedDate,
    };

    return boFeedback;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateBookingFeedbackService = async (
  content,
  rate,
  userId,
  bookingId
) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }
    const rating = Number(rate);
    if (Number.isInteger(rating) === false) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Sao đánh giá phải là số nguyên!"
      );
    } else if (rating < 1 || rating > 5) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Sao đánh giá không hợp lệ!");
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }

    const bookingFeedback = await BookingFeedback.findOne({
      where: { userId, bookingId },
    });
    if (!bookingFeedback) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đánh giá không tồn tại");
    } else {
      if (
        bookingFeedback.content === content &&
        bookingFeedback.rating === rating
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Bạn chưa thay đổi nội dung hoặc số sao đánh giá."
        );
      }
    }

    await bookingFeedback.update({
      content,
      rating,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getBookingFeedbackService = async (courtId) => {
  try {
    const bookingFeedbacks = await BookingFeedback.findAll({
      where: { courtId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username"],
          include: [
            {
              model: Profile,
              attributes: ["avatar"],
            },
          ],
        },
      ],
    });

    const newBookingFeedbacks = bookingFeedbacks.map((bf) => {
      return {
        rating: bf.rating,
        content: bf.content,
        updatedDate: bf.updatedDate,
        userId: bf.user.id,
        username: bf.user.username,
        avatar: bf.user.Profile.avatar,
      };
    });
    return newBookingFeedbacks;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const bookingFeedbackService = {
  createBookingFeedbackService,
  getBookingFeedbackUpdateService,
  updateBookingFeedbackService,
  getBookingFeedbackService,
};
export default bookingFeedbackService;
