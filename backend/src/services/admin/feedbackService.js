import { Op } from "sequelize";
import { Feedback, User, Profile, Branch, ProductVariant, Product } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";

const getAdminFeedbacksService = async (data) => {
  const { page = 1, limit = 10, branchId, rating, feedbackType, search } = data;
  const offset = (page - 1) * limit;

  const where = {};
  const trimmedSearch = String(search || "").trim();
  if (trimmedSearch) {
    where[Op.or] = [
      { content: { [Op.like]: `%${trimmedSearch}%` } },
      { "$user.username$": { [Op.like]: `%${trimmedSearch}%` } },
      { "$user.profile.fullName$": { [Op.like]: `%${trimmedSearch}%` } },
      { "$branch.branchName$": { [Op.like]: `%${trimmedSearch}%` } },
      { "$variant.product.productName$": { [Op.like]: `%${trimmedSearch}%` } },
    ];
  }
  if (branchId) where.branchId = branchId;
  if (rating) where.rating = Number(rating);
  if (feedbackType === "BRANCH") {
    where.branchId = { [Op.ne]: null };
    where.variantId = null;
  } else if (feedbackType === "PRODUCT") {
    where.variantId = { [Op.ne]: null };
    where.branchId = null;
  }

  const { rows, count } = await Feedback.findAndCountAll({
    where,
    attributes: ["id", "content", "rating", "branchId", "variantId", "orderId", "createdAt"],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username"],
        include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
      },
      {
        model: Branch,
        as: "branch",
        attributes: ["id", "branchName"],
        required: false,
      },
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id", "color", "size"],
        required: false,
        include: [
          { model: Product, as: "product", attributes: ["id", "productName", "thumbnailUrl"] },
        ],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const feedbacks = rows.map((f) => {
    const fb = f.toJSON();
    return {
      id: fb.id,
      content: fb.content,
      rating: fb.rating,
      createdAt: fb.createdAt,
      feedbackType: fb.branchId ? "BRANCH" : "PRODUCT",
      userId: fb.user?.id,
      userName: fb.user?.profile?.fullName || fb.user?.username,
      userAvatar: fb.user?.profile?.avatar,
      branchId: fb.branchId,
      branchName: fb.branch?.branchName,
      variantId: fb.variantId,
      productName: fb.variant?.product?.productName,
      productThumbnail: fb.variant?.product?.thumbnailUrl,
      variantInfo: fb.variant ? `${fb.variant.color || ""} ${fb.variant.size || ""}`.trim() : null,
    };
  });

  return { feedbacks, pagination: { page: Number(page), limit: Number(limit), total: count } };
};

const deleteAdminFeedbackService = async (feedbackId) => {
  const feedback = await Feedback.findByPk(feedbackId);
  if (!feedback) throw new NotFoundError("Không tìm thấy đánh giá");

  await feedback.destroy();
  return { id: Number(feedbackId) };
};

const adminFeedbackService = {
  getAdminFeedbacksService,
  deleteAdminFeedbackService,
};

export default adminFeedbackService;
