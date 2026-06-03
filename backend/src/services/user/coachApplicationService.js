import {
  CoachApplication,
  User,
  Profile,
  Role,
} from "../../models/index.js";
import {
  COACH_APPLICATION_STATUS,
  COACH_APPLICATION_NOTIFICATION,
} from "../../constants/coachApplicationConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import uploadBuffer from "../../utils/cloudinary.js";
import {
  sendAdminNotification,
  sendUserNotification,
} from "../../helpers/notification.js";

const userInclude = {
  model: User,
  as: "user",
  attributes: ["id", "username", "email", "isVerified"],
  include: [
    {
      model: Profile,
      as: "profile",
      attributes: ["fullName", "avatar", "phoneNumber"],
    },
    {
      model: Role,
      as: "role",
      attributes: ["roleName"],
    },
  ],
};

const formatApplication = (row) => {
  const plain = row.get ? row.get({ plain: true }) : row;
  return {
    id: plain.id,
    userId: plain.userId,
    status: plain.status,
    experienceYears: plain.experienceYears,
    certificate: plain.certificate,
    certificateImages: plain.certificateImages || [],
    introduction: plain.introduction,
    phoneContact: plain.phoneContact,
    rejectReason: plain.rejectReason,
    reviewedBy: plain.reviewedBy,
    reviewedAt: plain.reviewedAt,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    user: plain.user
      ? {
          id: plain.user.id,
          username: plain.user.username,
          email: plain.user.email,
          isVerified: plain.user.isVerified,
          fullName: plain.user.profile?.fullName || null,
          avatar: plain.user.profile?.avatar || null,
          phoneNumber: plain.user.profile?.phoneNumber || null,
          role: plain.user.role?.roleName || null,
        }
      : null,
  };
};

const assertCanApply = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: "role", attributes: ["roleName"] }],
  });
  if (!user) throw new BadRequestError("Không tìm thấy tài khoản");
  if (user.role?.roleName === ROLE_NAME.COACH) {
    throw new BadRequestError("Tài khoản đã được cấp quyền dạy cầu lông");
  }
  if (user.role?.roleName !== ROLE_NAME.USER) {
    throw new ForbiddenError("Chỉ tài khoản User mới được gửi yêu cầu dạy cầu lông");
  }
  if (!user.isVerified) {
    throw new BadRequestError("Vui lòng xác thực email trước khi đăng ký dạy cầu lông");
  }

  const pending = await CoachApplication.findOne({
    where: { userId, status: COACH_APPLICATION_STATUS.PENDING },
  });
  if (pending) {
    throw new BadRequestError("Bạn đã có yêu cầu đang chờ duyệt");
  }

  return user;
};

const getMyCoachApplicationService = async ({ userId }) => {
  const latest = await CoachApplication.findOne({
    where: { userId },
    order: [["createdAt", "DESC"]],
    include: [userInclude],
  });
  return latest ? formatApplication(latest) : null;
};

const submitCoachApplicationService = async (data) => {
  const {
    userId,
    experienceYears,
    certificate,
    introduction,
    phoneContact,
    certificateImages,
  } = data;

  await assertCanApply(userId);

  const payload = {
    userId,
    status: COACH_APPLICATION_STATUS.PENDING,
    experienceYears: Number(experienceYears) || 0,
    certificate: certificate?.trim() || null,
    introduction: introduction?.trim() || null,
    phoneContact: phoneContact?.trim() || null,
    certificateImages: Array.isArray(certificateImages)
      ? certificateImages.slice(0, 5)
      : [],
    rejectReason: null,
    reviewedBy: null,
    reviewedAt: null,
  };

  const rejected = await CoachApplication.findOne({
    where: { userId, status: COACH_APPLICATION_STATUS.REJECTED },
    order: [["createdAt", "DESC"]],
  });

  let application;
  if (rejected) {
    await rejected.update(payload);
    application = rejected;
  } else {
    application = await CoachApplication.create(payload);
  }

  const user = await User.findByPk(userId, {
    include: [{ model: Profile, as: "profile", attributes: ["fullName"] }],
  });
  const displayName =
    user?.profile?.fullName || user?.username || `User #${userId}`;

  await sendAdminNotification(
    COACH_APPLICATION_NOTIFICATION.NEW_REQUEST,
    "Yêu cầu đăng ký dạy cầu lông mới",
    `${displayName} vừa gửi yêu cầu dạy cầu lông.`,
  );

  const full = await CoachApplication.findByPk(application.id, {
    include: [userInclude],
  });
  return formatApplication(full);
};

const uploadApplicationCertificateImagesService = async ({ userId, files }) => {
  await assertCanApply(userId);

  if (!Array.isArray(files) || files.length === 0) {
    throw new BadRequestError("Vui lòng chọn ít nhất 1 ảnh chứng chỉ");
  }
  if (files.length > 5) {
    throw new BadRequestError("Tối đa 5 ảnh chứng chỉ");
  }

  const uploadedUrls = [];
  for (const file of files) {
    if (!file?.buffer) throw new BadRequestError("File ảnh không hợp lệ");
    if (!file.mimetype?.startsWith("image/")) {
      throw new BadRequestError("Chỉ chấp nhận file ảnh (jpg, png, webp)");
    }
    const result = await uploadBuffer(file.buffer, "coach_application_certificates");
    const url = result?.secure_url || result?.url;
    if (url) uploadedUrls.push(url);
  }

  return { urls: uploadedUrls };
};

const coachApplicationUserService = {
  getMyCoachApplicationService,
  submitCoachApplicationService,
  uploadApplicationCertificateImagesService,
};

export default coachApplicationUserService;
