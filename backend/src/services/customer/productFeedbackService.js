import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Order,
  OrderDetail,
  Product,
  ProductFeedback,
  ProductVarient,
  Profile,
  User,
} from "../../models/index.js";
import sequelize from "../../config/db.js";

const createFeedbackService = async (content, rate, userId, orderDetailId) => {
  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId);
    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");

    const rating = Number(rate);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Số sao đánh giá không hợp lệ!"
      );
    }

    const orderDetail = await OrderDetail.findByPk(orderDetailId);
    if (!orderDetail) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Chi tiết đơn hàng không tồn tại!"
      );
    }

    const existingFeedback = await ProductFeedback.findOne({
      where: { userId, orderDetailId },
    });
    if (existingFeedback) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Bạn đã đánh giá sản phẩm này rồi!"
      );
    }

    const order = await Order.findByPk(orderDetail.orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");
    }
    if (order.orderStatus !== "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn hàng chưa hoàn thành, không thể đánh giá!"
      );
    }

    await ProductFeedback.create(
      {
        content,
        rating,
        userId,
        orderDetailId,
        varientId: orderDetail.varientId,
      },
      { transaction: t }
    );

    await t.commit();
  } catch (error) {
    await t.rollback();

    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getFeedbackUpdateService = async (orderDetailId, userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");

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
      throw new ApiError(StatusCodes.NOT_FOUND, "Đánh giá không tồn tại!");
    }

    return {
      content: productFeedback.content,
      rating: productFeedback.rating,
      updatedDate: productFeedback.updatedDate,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateFeedbackService = async (content, rate, userId, orderDetailId) => {
  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId);
    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");

    const rating = Number(rate);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Số sao đánh giá không hợp lệ!"
      );
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
      throw new ApiError(StatusCodes.NOT_FOUND, "Đánh giá không tồn tại!");
    }

    if (
      productFeedback.content === content &&
      productFeedback.rating === rating
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Bạn chưa thay đổi nội dung hoặc số sao đánh giá!"
      );
    }

    await productFeedback.update({ content, rating }, { transaction: t });

    await t.commit();
  } catch (error) {
    await t.rollback();

    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getFeedbackProductService = async (productId) => {
  try {
    const product = await Product.findByPk(productId, {
      attributes: [],
      include: [
        {
          model: ProductVarient,
          as: "varients",
          attributes: ["id"],
        },
      ],
    });

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");
    }

    const productFeedbackList = await Promise.all(
      product.varients.map((varient) =>
        ProductFeedback.findAll({
          where: { varientId: varient.id },
          attributes: ["rating", "content", "updatedDate", "userId"],
        })
      )
    );

    const productFeedbacks = productFeedbackList.flat();

    const result = await Promise.all(
      productFeedbacks.map(async (pf) => {
        const user = await User.findByPk(pf.userId, {
          attributes: ["username"],
          include: [{ model: Profile, attributes: ["avatar"] }],
        });

        return {
          ...pf.dataValues,
          username: user?.username || null,
          avatar: user?.Profile?.avatar || null,
        };
      })
    );

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const productFeedbackService = {
  createFeedbackService,
  getFeedbackUpdateService,
  updateFeedbackService,
  getFeedbackProductService,
};

export default productFeedbackService;
