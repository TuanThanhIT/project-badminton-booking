import bookingFeedbackService from "../../services/customer/bookingFeedbackService.js";

const createBookingFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content, rating, bookingId, courtId } = req.body;
    await bookingFeedbackService.createBookingFeedbackService(
      content,
      rating,
      userId,
      bookingId,
      courtId
    );
    return res.status(201).json({ message: "Đánh giá sân thành công!" });
  } catch (error) {
    next(error);
  }
};

const getBookingFeedbackUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const bookingFeedback =
      await bookingFeedbackService.getBookingFeedbackUpdateService(
        bookingId,
        userId
      );

    return res.status(200).json(bookingFeedback);
  } catch (error) {
    next(error);
  }
};

const updateBookingFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { rating, content } = req.body;
    await bookingFeedbackService.updateBookingFeedbackService(
      content,
      rating,
      userId,
      bookingId
    );
    return res
      .status(200)
      .json({ message: "Cập nhật đánh giá cho sân thành công!" });
  } catch (error) {
    next(error);
  }
};

const getBookingFeedback = async (req, res, next) => {
  try {
    const courtId = req.params.id;
    const bookingFeedback =
      await bookingFeedbackService.getBookingFeedbackService(courtId);
    return res.status(200).json(bookingFeedback);
  } catch (error) {
    next(error);
  }
};
const bookingFeedbackController = {
  createBookingFeedback,
  getBookingFeedback,
  getBookingFeedbackUpdate,
  updateBookingFeedback,
};
export default bookingFeedbackController;
