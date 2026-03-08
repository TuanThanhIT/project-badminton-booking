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
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";

const createFeedbackService = async (data) => {
  const { content, rate, userId, orderDetailId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    const orderDetail = await OrderDetail.findByPk(orderDetailId, {
      transaction: t,
    });
    if (!orderDetail) {
      throw new NotFoundError("Chi tiết đơn hàng không tồn tại");
    }

    const existingFeedback = await ProductFeedback.findOne({
      where: { userId, orderDetailId },
      transaction: t,
    });

    if (existingFeedback) {
      throw new BadRequestError("Bạn đã đánh giá sản phẩm này rồi");
    }
    const order = await Order.findByPk(orderDetail.orderId, { transaction: t });
    if (!order) {
      throw new NotFoundError("Đơn hàng không tồn tại");
    }

    if (order.orderStatus !== ORDER_STATUS.COMPLETED) {
      throw new BadRequestError("Đơn hàng chưa hoàn thành, không thể đánh giá");
    }

    await ProductFeedback.create(
      {
        content,
        rating: rate,
        userId,
        orderDetailId,
        varientId: orderDetail.varientId,
      },
      { transaction: t },
    );
  });
};

const getFeedbackUpdateService = async (data) => {
  const { orderDetailId, userId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    const orderDetail = await OrderDetail.findByPk(orderDetailId, {
      transaction: t,
    });
    if (!orderDetail) {
      throw new NotFoundError("Chi tiết đơn hàng không tồn tại");
    }

    const productFeedback = await ProductFeedback.findOne({
      where: { userId, orderDetailId },
      transaction: t,
    });

    if (!productFeedback) {
      throw new NotFoundError("Đánh giá không tồn tại");
    }

    return {
      content: productFeedback.content,
      rating: productFeedback.rating,
      updatedDate: productFeedback.updatedDate,
    };
  });
};

const updateFeedbackService = async (data) => {
  const { content, rate, userId, orderDetailId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    const orderDetail = await OrderDetail.findByPk(orderDetailId, {
      transaction: t,
    });

    if (!orderDetail) {
      throw new NotFoundError("Chi tiết đơn hàng không tồn tại");
    }

    const productFeedback = await ProductFeedback.findOne({
      where: { userId, orderDetailId },
      transaction: t,
    });

    if (!productFeedback) {
      throw new NotFoundError("Đánh giá không tồn tại");
    }

    if (
      productFeedback.content === content &&
      productFeedback.rating === rate
    ) {
      throw new BadRequestError(
        "Bạn chưa thay đổi nội dung hoặc số sao đánh giá",
      );
    }

    await productFeedback.update({ content, rating: rate }, { transaction: t });
    return productFeedback;
  });
};

const getProductFeedbackService = async (data) => {
  const { productId } = data;
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
    throw new NotFoundError("Sản phẩm không tồn tại");
  }

  const productFeedbackList = await Promise.all(
    product.varients.map((varient) =>
      ProductFeedback.findAll({
        where: { varientId: varient.id },
        attributes: ["rating", "content", "updatedDate", "userId"],
      }),
    ),
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
    }),
  );

  return result;
};

const productFeedbackService = {
  createFeedbackService,
  getFeedbackUpdateService,
  updateFeedbackService,
  getProductFeedbackService,
};

export default productFeedbackService;
