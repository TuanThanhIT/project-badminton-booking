import sequelize from "../../config/db.js";
import { Post, Profile, User } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import uploadBuffer from "../../utils/cloudinary.js";

const getMyProfileService = async (data) => {
  const { User:currentUser } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { id: currentUser.id },
      transaction: t,
      attributes: ["id", "username", "email", "createdDate"],
      include: [
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
      createdDate: user.createdDate,
      postCount,
      profile: user.profile,
    };
  });
};

const updateMyProfileService = async (data) => {
  const {User} = data;
  const allowed = ["fullName", "dob", "gender", "address", "phoneNumber", "avatar"];
  const payload = {};
  allowed.forEach((key) => {
    if (data[key] !== undefined) payload[key] = data[key];
  });

  return sequelize.transaction(async (t) => {
    const profile = await Profile.findOne({
      where: { userId: User.id, isDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!profile) throw new NotFoundError("Không tìm thấy hồ sơ người dùng.");

    await profile.update(payload, { transaction: t });
    return profile;
  });
};

const uploadMyAvatarService = async (data) => {
  const { currentUser, file } = data;
  if (!file?.buffer) throw new BadRequestError("Vui lòng chọn file ảnh.");
  if (!file.mimetype?.startsWith("image/")) {
    throw new BadRequestError("Chỉ chấp nhận file ảnh (jpg, png, webp…).");
  }
  const result = await uploadBuffer(file.buffer, "profile_avatars");
  const avatarUrl = result?.secure_url || result?.url;
  if (!avatarUrl) throw new BadRequestError("Tải ảnh lên thất bại.");
  return updateMyProfileService(currentUser, { avatar: avatarUrl });
};

const getPublicProfileService = async (data) => {
  const { userId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { id: userId, isActive: true },
      transaction: t,
      attributes: ["id", "username", "email", "createdDate"],
      include: [
        {
          model: Profile,
          as: "profile",
          attributes: ["fullName", "avatar", "phoneNumber"],
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
      createdDate: user.createdDate,
      postCount,
      profile: user.profile,
    };
  });
};

const profileService = {
  getMyProfileService,
  updateMyProfileService,
  uploadMyAvatarService,
  getPublicProfileService,
};

export default profileService;
