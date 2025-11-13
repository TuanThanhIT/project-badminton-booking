import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Order,
  OrderDetail,
  ProductFeedback,
  User,
} from "../../models/index.js";

const createFeedbackService = async (content, rate, userId, orderDetailId) => {
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

    const orderDetail = await OrderDetail.findByPk(orderDetailId);
    if (!orderDetail) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Chi tiết đơn hàng không tồn tại!"
      );
    }

    const productFeedback = await ProductFeedback.findOne({
      where: { userId, orderDetailId },
    });
    if (productFeedback) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Bạn đã đánh giá sản phẩm này rồi!"
      );
    }

    const order = await Order.findByPk(orderDetail.orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");
    } else {
      if (order.orderStatus !== "Completed") {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Đơn hàng của bạn không hợp lệ, không thể đánh giá sản phẩm!"
        );
      }
    }

    await ProductFeedback.create({
      content,
      rating,
      userId,
      orderDetailId,
      varientId: orderDetail.varientId,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getFeedbackUpdateService = async (orderDetailId, userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }
    const orderDetail = await OrderDetail.findByPk(orderDetailId);
    if (!orderDetail) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Chi tiết đơn hàng không tồn tại!"
      );
    }

    const productFeedback = await ProductFeedback.findOne({
      where: { userId, orderDetailId },
    });

    if (!productFeedback) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Đánh giá cho sản phẩm không tồn tại!"
      );
    }

    const proFeedback = {
      content: productFeedback.content,
      rating: productFeedback.rating,
      updatedDate: productFeedback.updatedDate,
    };

    return proFeedback;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateFeedbackService = async (content, rate, userId, orderDetailId) => {
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

    const orderDetail = await OrderDetail.findByPk(orderDetailId);
    if (!orderDetail) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Chi tiết đơn hàng không tồn tại!"
      );
    }

    const productFeedback = await ProductFeedback.findOne({
      where: { userId, orderDetailId },
    });
    if (!productFeedback) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đánh giá không tồn tại");
    } else {
      if (
        productFeedback.content === content &&
        productFeedback.rating === rating
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Bạn chưa thay đổi nội dung hoặc số sao đánh giá."
        );
      }
    }

    await productFeedback.update({
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
const productFeedbackService = {
  createFeedbackService,
  getFeedbackUpdateService,
  updateFeedbackService,
};
export default productFeedbackService;
