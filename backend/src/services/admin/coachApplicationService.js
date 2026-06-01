import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  BranchManager,
  CoachApplication,
  CoachProfile,
  Profile,
  Role,
  User,
} from "../../models/index.js";
import {
  COACH_APPLICATION_NOTIFICATION,
  COACH_APPLICATION_STATUS,
} from "../../constants/coachApplicationConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { sendUserNotification } from "../../helpers/notification.js";

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
    createdDate: plain.createdDate,
    updatedDate: plain.updatedDate,
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

const getCoachApplicationsService = async (data) => {
  const { page = 1, limit = 10, status, search } = data;
  const where = {};
  if (status) where.status = status;

  const offset = (Number(page) - 1) * Number(limit);

  const include = [userInclude];
  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    include[0] = {
      ...userInclude,
      where: {
        [Op.or]: [
          { username: { [Op.like]: term } },
          { email: { [Op.like]: term } },
        ],
      },
      required: true,
      include: [
        {
          model: Profile,
          as: "profile",
          attributes: ["fullName", "avatar", "phoneNumber"],
          required: false,
        },
        {
          model: Role,
          as: "role",
          attributes: ["roleName"],
        },
      ],
    };
  }

  const result = await CoachApplication.findAndCountAll({
    where,
    include,
    order: [["createdDate", "DESC"]],
    limit: Number(limit),
    offset,
    distinct: true,
  });

  const pendingCount = await CoachApplication.count({
    where: { status: COACH_APPLICATION_STATUS.PENDING },
  });

  return {
    applications: result.rows.map(formatApplication),
    pagination: {
      total: result.count,
      page: Number(page),
      limit: Number(limit),
    },
    pendingCount,
  };
};

const getCoachApplicationByIdService = async (id) => {
  const application = await CoachApplication.findByPk(id, {
    include: [userInclude],
  });
  if (!application) throw new NotFoundError("Không tìm thấy yêu cầu");
  return formatApplication(application);
};

const promoteUserToCoach = async ({
  userId,
  application,
  transaction,
}) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: "role", attributes: ["roleName"] }],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");

  if (user.role?.roleName === ROLE_NAME.ADMIN) {
    throw new BadRequestError("Không thể cấp quyền dạy cầu lông cho Admin qua yêu cầu này");
  }
  if (user.role?.roleName === ROLE_NAME.COACH) {
    throw new BadRequestError("Người dùng đã có quyền dạy cầu lông");
  }

  const targetRole = await Role.findOne({
    where: { roleName: ROLE_NAME.COACH },
    transaction,
  });
  if (!targetRole) throw new NotFoundError("Không tìm thấy role COACH");

  if (user.role?.roleName === ROLE_NAME.MANAGER) {
    await BranchManager.update(
      { isActive: false, revokedDate: new Date() },
      { where: { managerId: userId, isActive: true }, transaction },
    );
  }

  await user.update({ roleId: targetRole.id }, { transaction });

  const [coachProfile] = await CoachProfile.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      experienceYears: application.experienceYears ?? 0,
      certificate: application.certificate ?? null,
      certificateImages: application.certificateImages ?? [],
      introduction: application.introduction ?? null,
    },
    transaction,
  });

  await coachProfile.update(
    {
      experienceYears: application.experienceYears ?? 0,
      certificate: application.certificate ?? null,
      certificateImages: application.certificateImages ?? [],
      introduction: application.introduction ?? null,
    },
    { transaction },
  );
};

const approveCoachApplicationService = async ({ applicationId, adminId }) => {
  return sequelize.transaction(async (transaction) => {
    const application = await CoachApplication.findByPk(applicationId, {
      include: [userInclude],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!application) throw new NotFoundError("Không tìm thấy yêu cầu");
    if (application.status !== COACH_APPLICATION_STATUS.PENDING) {
      throw new BadRequestError("Yêu cầu không còn ở trạng thái chờ duyệt");
    }

    await promoteUserToCoach({
      userId: application.userId,
      application,
      transaction,
    });

    await application.update(
      {
        status: COACH_APPLICATION_STATUS.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectReason: null,
      },
      { transaction },
    );

    await sendUserNotification(
      application.userId,
      COACH_APPLICATION_NOTIFICATION.APPROVED,
      "Đăng ký dạy cầu lông được duyệt",
      "Chúc mừng! Yêu cầu dạy cầu lông của bạn đã được duyệt. Hãy đăng nhập lại để sử dụng các tính năng dạy lớp.",
      { transaction },
    );

    return formatApplication(application);
  });
};

const rejectCoachApplicationService = async ({
  applicationId,
  adminId,
  rejectReason,
}) => {
  return sequelize.transaction(async (transaction) => {
    const application = await CoachApplication.findByPk(applicationId, {
      include: [userInclude],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!application) throw new NotFoundError("Không tìm thấy yêu cầu");
    if (application.status !== COACH_APPLICATION_STATUS.PENDING) {
      throw new BadRequestError("Yêu cầu không còn ở trạng thái chờ duyệt");
    }

    await application.update(
      {
        status: COACH_APPLICATION_STATUS.REJECTED,
        rejectReason: rejectReason?.trim() || null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      { transaction },
    );

    await sendUserNotification(
      application.userId,
      COACH_APPLICATION_NOTIFICATION.REJECTED,
      "Đăng ký dạy cầu lông bị từ chối",
      rejectReason?.trim()
        ? `Yêu cầu dạy cầu lông bị từ chối. Lý do: ${rejectReason.trim()}`
        : "Yêu cầu dạy cầu lông của bạn đã bị từ chối.",
      { transaction },
    );

    return formatApplication(application);
  });
};

const coachApplicationAdminService = {
  getCoachApplicationsService,
  getCoachApplicationByIdService,
  approveCoachApplicationService,
  rejectCoachApplicationService,
};

export default coachApplicationAdminService;
