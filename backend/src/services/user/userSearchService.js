import { Op } from "sequelize";
import { Profile, User } from "../../models/index.js";

/**
 * Tìm người dùng theo username hoặc họ tên (Profiles.fullName), bỏ qua chính mình.
 * Bỏ ký tự % _ trong ô tìm để tránh LIKE injection.
 */
const searchUsersByNameService = async (data) => {
  const { User: currentUser, q: query, limit = 15 } = data;
  const raw = (query || "").trim();
  if (raw.length < 1) return [];

  const safe = raw.replace(/[%\\]/g, "").trim().slice(0, 50);
  if (!safe) return [];

  const lim = Math.min(Math.max(Number(limit) || 15, 1), 25);
  const like = `%${safe}%`;

  const users = await User.findAll({
    where: {
      id: { [Op.ne]: currentUser.id },
      isActive: true,
      [Op.or]: [
        { username: { [Op.like]: like } },
        { email: { [Op.like]: like } },
        { "$profile.phoneNumber$": { [Op.like]: like } },
      ],
    },
    attributes: ["id", "username", "email"],
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName", "avatar", "phoneNumber"],
      },
    ],
    order: [
      ["username", "ASC"],
    ],
    limit: lim,
  });

  return users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email || null,
    fullName: user.profile?.fullName || null,
    avatar: user.profile?.avatar || null,
    phoneNumber: user.profile?.phoneNumber || null,
  }));
};

export default { searchUsersByNameService };
