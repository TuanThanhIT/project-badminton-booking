import {
  Booking,
  User,
  Court,
  BookingFeedback,
  Profile,
} from "../../models/index.js";
import sequelize from "../../config/db.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const createBookingFeedbackService = async (data) => {
  const { content, rate, userId, bookingId, courtId } = data;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }

  const rating = Number(rate);
  if (Number.isInteger(rating) === false) {
    throw new BadRequestError("Sao đánh giá phải là số nguyên");
  } else if (rating < 1 || rating > 5) {
    throw new BadRequestError("Sao đánh giá không hợp lệ");
  }

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new NotFoundError("Lịch đặt sân không tồn tại");
  } else {
    if (booking.bookingStatus !== "Completed") {
      throw new BadRequestError(
        "Đặt sân chưa thành công. Bạn không thể đánh giá sân này được",
      );
    }
  }

  const court = await Court.findByPk(courtId);
  if (!court) {
    throw new NotFoundError("Sân này không tồn tại");
  }

  await BookingFeedback.create({
    content,
    rating,
    userId,
    bookingId,
    courtId,
  });
};

const getBookingFeedbackUpdateService = async (data) => {
  const { bookingId, userId } = data;
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    throw new NotFoundError("Lịch đặt sân không tồn tại");
  }

  const bookingFeedback = await BookingFeedback.findOne({
    where: { userId, bookingId },
  });

  if (!bookingFeedback) {
    throw new NotFoundError("Đánh giá sân không tồn tại");
  }

  const boFeedback = {
    content: bookingFeedback.content,
    rating: bookingFeedback.rating,
    updatedDate: bookingFeedback.updatedDate,
  };

  return boFeedback;
};

const updateBookingFeedbackService = async (data) => {
  const { content, rate, userId, bookingId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }
    const rating = Number(rate);
    if (Number.isInteger(rating) === false) {
      throw new BadRequestError("Sao đánh giá phải là số nguyên");
    } else if (rating < 1 || rating > 5) {
      throw new BadRequestError("Sao đánh giá không hợp lệ");
    }

    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) {
      throw new NotFoundError("Lịch đặt sân không tồn tại");
    }

    const bookingFeedback = await BookingFeedback.findOne({
      where: { userId, bookingId },
      transaction: t,
    });
    if (!bookingFeedback) {
      throw new NotFoundError("Đánh giá không tồn tại");
    } else if (
      bookingFeedback.content === content &&
      bookingFeedback.rating === rating
    ) {
      throw new BadRequestError(
        "Bạn chưa thay đổi nội dung hoặc số sao đánh giá",
      );
    }

    await bookingFeedback.update(
      {
        content,
        rating,
      },
      { transaction: t },
    );
  });
};

const getBookingFeedbackService = async (data) => {
  const { courtId } = data;
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
};

const bookingFeedbackService = {
  createBookingFeedbackService,
  getBookingFeedbackUpdateService,
  updateBookingFeedbackService,
  getBookingFeedbackService,
};
export default bookingFeedbackService;
