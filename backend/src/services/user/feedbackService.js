import { redisClient } from "../../config/redis.js";
import sequelize from "../../config/db.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  Booking,
  Branch,
  Feedback,
  Order,
  OrderGroup,
} from "../../models/index.js";

const canReviewBranch = async ({ userId, branchId, transaction }) => {
  const completedOrder = await Order.findOne({
    where: {
      branchId,
      orderStatus: ORDER_STATUS.COMPLETED,
    },
    include: [
      {
        model: OrderGroup,
        as: "orderGroup",
        attributes: ["id"],
        where: { userId },
      },
    ],
    transaction,
  });

  if (completedOrder) return true;

  const completedBooking = await Booking.findOne({
    where: {
      userId,
      branchId,
      bookingStatus: BOOKING_STATUS.COMPLETED,
    },
    transaction,
  });

  return !!completedBooking;
};

const formatFeedbackDetail = (feedback) => ({
  feedbackId: feedback.id,
  content: feedback.content,
  rating: feedback.rating,
  createdAt: feedback.createdAt,
  updatedAt: feedback.updatedAt,
});

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
    attributes: ["id", "content", "rating", "createdAt", "updatedAt"],
  });

  if (!feedback) {
    throw new NotFoundError("Chưa có đánh giá cho sản phẩm này");
  }

  return {
    feedbackId: feedback.id,
    content: feedback.content,
    rating: feedback.rating,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
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

const upsertFeedbackBranchService = async (data) => {
  const { userId, branchId, content, rating } = data;

  return sequelize.transaction(async (transaction) => {
    const branch = await Branch.findOne({
      where: {
        id: branchId,
        isActive: true,
      },
      attributes: ["id"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!branch) {
      throw new NotFoundError("Khong tim thay chi nhanh");
    }

    const allowed = await canReviewBranch({ userId, branchId, transaction });

    if (!allowed) {
      throw new BadRequestError(
        "Ban chi co the danh gia chi nhanh sau khi co don hang hoac lich dat san hoan thanh tai chi nhanh nay",
      );
    }

    const feedback = await Feedback.findOne({
      where: {
        userId,
        branchId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (feedback) {
      await feedback.update({ content, rating }, { transaction });
      return formatFeedbackDetail(feedback);
    }

    const newFeedback = await Feedback.create(
      {
        userId,
        branchId,
        content,
        rating,
      },
      { transaction },
    );

    return formatFeedbackDetail(newFeedback);
  });
};

const getFeedbackBranchDetailService = async (data) => {
  const { userId, branchId } = data;

  const feedback = await Feedback.findOne({
    where: {
      userId,
      branchId,
    },
    attributes: ["id", "content", "rating", "createdAt", "updatedAt"],
  });

  if (!feedback) {
    throw new NotFoundError("Chua co danh gia cho chi nhanh nay");
  }

  return formatFeedbackDetail(feedback);
};

const feedbackService = {
  getFeedbackOrderDetailService,
  createFeedbackOrderService,
  updateFeedbackOrderService,
  deleteFeedbackOrderService,
  upsertFeedbackBranchService,
  getFeedbackBranchDetailService,
};

export default feedbackService;
