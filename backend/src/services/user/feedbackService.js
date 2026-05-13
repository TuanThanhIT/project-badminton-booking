import { redisClient } from "../../config/redis.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { Feedback, Order } from "../../models/index.js";

const createFeedbackOrderService = async (data) => {
  const { userId, orderId, variantId, content, rating } = data;

  const order = await Order.findByPk(orderId);
  if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

  // chỉ cho review khi COMPLETED
  if (order.orderStatus !== ORDER_STATUS.COMPLETED) {
    throw new BadRequestError("Đơn hàng chưa hoàn thành");
  }

  // check đã review chưa (Redis first)
  const reviewKey = `review:order:${orderId}:user:${userId}`;

  const existed = await redisClient.sismember(reviewKey, variantId);

  if (existed) {
    throw new ConflictError("Sản phẩm này đã được đánh giá");
  }

  // 1. save DB
  const feedback = await Feedback.create({
    userId,
    orderId,
    variantId,
    content,
    rating,
  });

  // 2. update Redis cache
  await redisClient.sadd(reviewKey, variantId);

  return feedback;
};

const updateFeedbackOrderService = async (data) => {
  const { userId, orderId, variantId, content, rating } = data;

  const feedback = await Feedback.findOne({
    where: {
      userId,
      orderId,
      variantId,
    },
  });

  if (!feedback) {
    throw new NotFoundError("Chưa có review để sửa");
  }

  await feedback.update({
    content,
    rating,
  });

  return feedback;
};

const getFeedbackOrderDetailService = async (data) => {
  const { userId, orderId, variantId } = data;

  const feedback = await Feedback.findOne({
    where: {
      userId,
      orderId,
      variantId,
    },
    attributes: ["id", "content", "rating", "createdDate", "updatedDate"],
  });

  if (!feedback) {
    throw new NotFoundError("Chưa có đánh giá cho sản phẩm này");
  }

  return {
    feedbackId: feedback.id,
    content: feedback.content,
    rating: feedback.rating,
    createdDate: feedback.createdDate,
    updatedDate: feedback.updatedDate,
  };
};

const deleteFeedbackOrderService = async (data) => {
  const { feedbackId, userId } = data;

  const feedback = await Feedback.findOne({
    where: {
      id: feedbackId,
      userId,
    },
  });

  if (!feedback) {
    throw new NotFoundError("Không tìm thấy đánh giá");
  }

  // lấy trước khi xóa để dùng clear redis
  const { orderId, variantId } = feedback;

  // xóa DB
  await feedback.destroy();

  // xóa cache redis
  const reviewKey = `review:order:${orderId}:user:${userId}`;

  await redisClient.srem(reviewKey, variantId);

  return true;
};

const feedbackService = {
  getFeedbackOrderDetailService,
  createFeedbackOrderService,
  updateFeedbackOrderService,
  deleteFeedbackOrderService,
};

export default feedbackService;
