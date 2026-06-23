import sequelize from "../../config/db.js";
import { CoachProfile, Post, Profile, Role, User } from "../../models/index.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import uploadBuffer from "../../utils/cloudinary.js";

const getMyProfileService = async (data) => {
  const { userId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { id: userId },
      transaction: t,
      attributes: [
        "id",
        "username",
        "email",
        "createdAt",
        "accountStatus",
        "suspendedUntil",
        "suspensionReason",
        "violationCount",
        "lastViolationAt",
      ],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["roleName"],
        },
        {
          model: Profile,
          as: "profile",
          attributes: [
            "fullName",
            "dob",
            "gender",
            "address",
            "phoneNumber",
            "avatar",
            "level",
          ],
        },
        {
          model: CoachProfile,
          as: "coachProfile",
          attributes: [
            "experienceYears",
            "certificate",
            "certificateImages",
            "introduction",
          ],
          required: false,
        },
      ],
    });

    if (!user) throw new NotFoundError("Không tìm thấy người dùng.");

    const postCount = await Post.count({
      where: { authorId: user.id, isDeleted: false, isActive: true },
      transaction: t,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role?.roleName,
      createdDate: user.createdDate,
      accountStatus: user.accountStatus,
      suspendedUntil: user.suspendedUntil,
      suspensionReason: user.suspensionReason,
      violationCount: user.violationCount,
      lastViolationAt: user.lastViolationAt,
      postCount,
      profile: user.profile,
      coachProfile: user.coachProfile,
    };
  });
};

const updateMyProfileService = async (data) => {
  const { userId, userRole, coachProfile } = data;
  const allowed = ["fullName", "dob", "gender", "address", "phoneNumber", "avatar", "level"];
  const payload = {};
  allowed.forEach((key) => {
    if (data[key] !== undefined) payload[key] = data[key];
  });

  await sequelize.transaction(async (t) => {
    const profile = await Profile.findOne({
      where: { userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!profile) throw new NotFoundError("Không tìm thấy hồ sơ người dùng.");

    await profile.update(payload, { transaction: t });

    if (coachProfile !== undefined) {
      if (userRole !== ROLE_NAME.COACH) {
        throw new BadRequestError("Chỉ người dạy cầu lông mới được cập nhật hồ sơ dạy.");
      }

      const coachPayload = {};
      [
        "experienceYears",
        "certificate",
        "certificateImages",
        "introduction",
      ].forEach((key) => {
        if (coachProfile[key] !== undefined) coachPayload[key] = coachProfile[key];
      });

      if (Object.keys(coachPayload).length > 0) {
        const [record] = await CoachProfile.findOrCreate({
          where: { userId },
          defaults: {
            userId,
            experienceYears: coachPayload.experienceYears ?? 0,
            certificate: coachPayload.certificate ?? null,
            certificateImages: coachPayload.certificateImages ?? [],
            introduction: coachPayload.introduction ?? null,
          },
          transaction: t,
        });

        await record.update(coachPayload, { transaction: t });
      }
    }
  });

  return getMyProfileService({ userId });
};

const uploadMyAvatarService = async (data) => {
  const { userId, file } = data;
  if (!file?.buffer) throw new BadRequestError("Vui lòng chọn file ảnh.");
  if (!file.mimetype?.startsWith("image/")) {
    throw new BadRequestError("Chỉ chấp nhận file ảnh (jpg, png, webp…).");
  }
  const result = await uploadBuffer(file.buffer, "profile_avatars");
  const avatarUrl = result?.secure_url || result?.url;
  if (!avatarUrl) throw new BadRequestError("Tải ảnh lên thất bại.");
  return updateMyProfileService({ userId, avatar: avatarUrl });
};

const uploadCoachCertificateImagesService = async (data) => {
  const { userId, userRole, files } = data;
  if (userRole !== ROLE_NAME.COACH) {
    throw new BadRequestError("Chỉ người dạy cầu lông mới được tải ảnh chứng chỉ.");
  }
  if (!Array.isArray(files) || files.length === 0) {
    throw new BadRequestError("Vui lòng chọn ít nhất 1 ảnh chứng chỉ.");
  }

  const uploadedUrls = [];
  for (const file of files) {
    if (!file?.buffer) throw new BadRequestError("File ảnh không hợp lệ.");
    if (!file.mimetype?.startsWith("image/")) {
      throw new BadRequestError("Chỉ chấp nhận file ảnh (jpg, png, webp).");
    }
    const result = await uploadBuffer(file.buffer, "coach_certificates");
    const url = result?.secure_url || result?.url;
    if (url) uploadedUrls.push(url);
  }

  if (uploadedUrls.length === 0) {
    throw new BadRequestError("Tải ảnh chứng chỉ thất bại.");
  }

  await sequelize.transaction(async (t) => {
    const [record] = await CoachProfile.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        experienceYears: 0,
        certificate: null,
        certificateImages: [],
        introduction: null,
      },
      transaction: t,
    });

    const currentImages = Array.isArray(record.certificateImages)
      ? record.certificateImages
      : [];
    const nextImages = [...currentImages, ...uploadedUrls].slice(0, 10);
    await record.update({ certificateImages: nextImages }, { transaction: t });
  });

  return getMyProfileService({ userId });
};

const getPublicProfileService = async (data) => {
  const { userId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { id: userId, isActive: true },
      transaction: t,
      attributes: ["id", "username", "email", "createdAt"],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["roleName"],
        },
        {
          model: Profile,
          as: "profile",
          attributes: ["fullName", "avatar", "phoneNumber", "level"],
        },
        {
          model: CoachProfile,
          as: "coachProfile",
          attributes: [
            "experienceYears",
            "certificate",
            "certificateImages",
            "introduction",
          ],
          required: false,
        },
      ],
    });

    if (!user) throw new NotFoundError("Không tìm thấy người dùng.");

    const postCount = await Post.count({
      where: { authorId: user.id, isDeleted: false, isActive: true },
      transaction: t,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role?.roleName,
      createdDate: user.createdDate,
      postCount,
      profile: user.profile,
      coachProfile: user.coachProfile,
    };
  });
};

const profileService = {
  getMyProfileService,
  updateMyProfileService,
  uploadMyAvatarService,
  uploadCoachCertificateImagesService,
  getPublicProfileService,
};

export default profileService;
