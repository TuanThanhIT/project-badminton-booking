import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import {
  Booking,
  Branch,
  BranchImage,
  Feedback,
  Order,
  OrderGroup,
  Profile,
  User,
} from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";

const canUserReviewBranch = async ({ userId, branchId }) => {
  if (!userId) return false;

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
    attributes: ["id"],
  });

  if (completedOrder) return true;

  const completedBooking = await Booking.findOne({
    where: {
      userId,
      branchId,
      bookingStatus: BOOKING_STATUS.COMPLETED,
    },
    attributes: ["id"],
  });

  return !!completedBooking;
};

const formatBranchFeedback = (feedback) => ({
  id: feedback.id,
  content: feedback.content,
  rating: feedback.rating,
  createdAt: feedback.createdAt,
  updatedAt: feedback.updatedAt,
  user: {
    id: feedback.user?.id,
    email: feedback.user?.email,
    fullName: feedback.user?.profile?.fullName,
    avatar: feedback.user?.profile?.avatar,
  },
});

const getBranchOptionsService = async () => {
  const branches = await Branch.findAll({
    where: {
      isActive: true,
    },
    attributes: ["id", "branchName"],
    order: [["branchName", "ASC"]],
  });

  return branches;
};

const getPagedBranchesService = async (data) => {
  const { page = 1, limit = 10, provinceName, districtName } = data;

  const offset = (page - 1) * limit;

  const where = {
    isActive: true,
  };

  if (provinceName) {
    where.provinceName = {
      [Op.like]: `%${provinceName}%`,
    };
  }

  if (districtName) {
    where.districtName = {
      [Op.like]: `%${districtName}%`,
    };
  }

  const { rows, count } = await Branch.findAndCountAll({
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
      "phoneNumber",
      "latitude",
      "longitude",
    ],
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
  });

  const branches = rows.map((item) => {
    const branch = item.toJSON();

    return {
      ...branch,
      fullAddress: `${branch.address}, ${branch.wardName}, ${branch.districtName}, ${branch.provinceName}`,
    };
  });

  return {
    branches,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
  };
};

const getBranchDetailService = async (data) => {
  const { branchId, userId } = data;

  const branch = await Branch.findOne({
    where: {
      id: branchId,
      isActive: true,
    },
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
      "phoneNumber",
      "longitude",
      "latitude",
      "description",
    ],
    include: [
      {
        model: BranchImage,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
      {
        model: User,
        as: "managers",
        attributes: ["email"],
        include: {
          model: Profile,
          as: "profile",
          attributes: ["fullName", "phoneNumber"],
        },
      },
    ],
  });

  if (!branch)
    throw new NotFoundError(
      "Không tìm thấy chi nhánh hoặc chi nhánh không hoạt động",
    );

  const dataBranch = branch.toJSON();

  // flatten managers
  const managers = dataBranch.managers.map((m) => ({
    email: m.email,
    fullName: m.profile?.fullName,
    phoneNumber: m.profile?.phoneNumber,
  }));

  const feedbackRows = await Feedback.findAll({
    where: { branchId },
    attributes: [
      "id",
      "userId",
      "content",
      "rating",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "avatar"],
          },
        ],
      },
    ],
    order: [["updatedAt", "DESC"]],
  });

  const feedbacks = feedbackRows.map((feedback) =>
    formatBranchFeedback(feedback.toJSON()),
  );
  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks
    ? Number(
        (
          feedbacks.reduce((total, item) => total + Number(item.rating), 0) /
          totalFeedbacks
        ).toFixed(1),
      )
    : 0;
  const myFeedback =
    feedbacks.find(
      (feedback) => Number(feedback.user?.id) === Number(userId),
    ) ||
    null;
  const canReview = await canUserReviewBranch({ userId, branchId });

  return {
    id: dataBranch.id,
    branchName: dataBranch.branchName,
    phoneNumber: dataBranch.phoneNumber,
    description: dataBranch.description,
    longitude: dataBranch.longitude,
    latitude: dataBranch.latitude,
    fullAddress: `${dataBranch.address}, ${dataBranch.wardName}, ${dataBranch.districtName}, ${dataBranch.provinceName}, Việt Nam`,
    images: dataBranch.images,
    managers,
    feedbackSummary: {
      totalFeedbacks,
      averageRating,
    },
    feedbacks,
    myFeedback,
    canReview,
  };
};

const getAllBranchesService = async () => {
  const branches = await Branch.findAll({
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
    ],
  });
  return branches;
};

const branchService = {
  getBranchOptionsService,
  getPagedBranchesService,
  getBranchDetailService,
  getAllBranchesService,
};

export default branchService;
