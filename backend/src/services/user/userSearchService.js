import { QueryTypes } from "sequelize";
import sequelize from "../../config/db.js";

/**
 * Tìm người dùng theo username hoặc họ tên (Profiles.fullName), bỏ qua chính mình.
 * Bỏ ký tự % _ trong ô tìm để tránh LIKE injection.
 */
const searchUsersByNameService = async (data) => {
  const { User: currentUser, q: query, limit = 15 } = data;
  const raw = (query || "").trim();
  if (raw.length < 1) return [];

  const safe = raw.replace(/[%_\\]/g, "").trim().slice(0, 50);
  if (!safe) return [];

  const lim = Math.min(Math.max(Number(limit) || 15, 1), 25);
  const like = `%${safe}%`;

  const rows = await sequelize.query(
    `SELECT u.id, u.username, p.fullName AS fullName, p.avatar AS avatar
     FROM Users u
     LEFT JOIN Profiles p ON p.userId = u.id
     WHERE u.isActive = 1 AND u.id != :excludeId
     AND (u.username LIKE :like OR COALESCE(p.fullName, '') LIKE :like)
     ORDER BY u.username ASC
     LIMIT :lim`,
    {
      replacements: { excludeId: currentUser.id, like, lim },
      type: QueryTypes.SELECT,
    },
  );

  return rows;
};

export default { searchUsersByNameService };
