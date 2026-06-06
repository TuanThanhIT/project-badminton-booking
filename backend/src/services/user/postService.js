import sequelize from "../../config/db.js";
import { Post, User, Profile, ClassRoom } from "../../models/index.js";
import { POST_TYPE } from "../../constants/postConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import { CLASS_ENROLLMENT_STATUS } from "../../constants/classConstant.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { Op } from "sequelize";

// Tạo bài đăng mới. Nếu type = Class thì chỉ Coach được đăng.
const createPostService = async (data) => {
  const { title, content, type, formData, userId, userRole } = data;

  return sequelize.transaction(async (t) => {
    // Rule: chỉ Coach được đăng lớp học
    if (type === POST_TYPE.CLASS && userRole !== ROLE_NAME.COACH) {
      throw new ForbiddenError("Chỉ người dạy cầu lông mới được đăng bài lớp học.");
    }

    const post = await Post.create(
      {
        authorId: userId,
        type,
        title: title?.trim(),
        content: content?.trim() || null,
        formData: formData || null,
        isActive: true,
        isDeleted: false,
      },
      { transaction: t },
    );

    if (type === POST_TYPE.CLASS) {
      await ClassRoom.findOrCreate({
        where: { postId: post.id },
        defaults: {
          postId: post.id,
          coachUserId: userId,
          conversationId: null,
          enrollmentStatus: CLASS_ENROLLMENT_STATUS.OPEN,
        },
        transaction: t,
      });
    }

    // Nếu muốn trả thêm thông tin author/profile (optional)
    const created = await Post.findOne({
      where: { id: post.id },
      transaction: t,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "email"],
          include: [
            {
              model: Profile,
              as: "profile",
              attributes: ["fullName", "avatar"],
            },
          ],
        },
      ],
    });

    return created;
  });
};

const getPostsService = async (data) => {
  // Tự động gom các key dạng formData[location.branchId]=4 thành object filter động
  let formDataFilters = {};
  for (const [key, value] of Object.entries(data)) {
    const match = key.match(/^formData\[(.+)\]$/);
    if (match) {
      formDataFilters[match[1]] = value;
    }
  }
  // Nếu không có key dạng formData[...], fallback về data.formData nếu là object (hỗ trợ filter truyền thẳng object)
  if (Object.keys(formDataFilters).length === 0 && typeof data.formData === 'object') {
    // flatten object nếu là { location: { branchId: 4 } } thành { 'location.branchId': 4 }
    const flatten = (obj, prefix = '') =>
      Object.entries(obj).reduce((acc, [k, v]) => {
        const pre = prefix ? prefix + '.' : '';
        if (typeof v === 'object' && v !== null) Object.assign(acc, flatten(v, pre + k));
        else acc[pre + k] = v;
        return acc;
      }, {});
    formDataFilters = flatten(data.formData);
  }
  const page = Number(data.page || 1);
  const limit = Number(data.limit || 10);
  const offset = (page - 1) * limit;
  const type = data.type;
  const authorId =
    data.authorId !== undefined ? Number(data.authorId) : undefined;
  const search = data.search || data.q;
  const hideReposts = String(data.hideReposts) === "1";

  return sequelize.transaction(async (t) => {
    const where = { isDeleted: false, isActive: true };
    if (type) where.type = type;
    if (authorId && Number.isInteger(authorId) && authorId > 0) {
      where.authorId = authorId;
    }

    const andConditions = [];

    // Tìm kiếm theo tiêu đề / nội dung (nhiều từ → mỗi từ phải xuất hiện)
    if (search && typeof search === "string" && search.trim()) {
      const raw = search.trim();
      const tokens = raw.split(/\s+/).filter((t) => t.length >= 2);

      if (tokens.length > 1) {
        for (const token of tokens) {
          const term = `%${token}%`;
          andConditions.push(
            sequelize.or(
              { title: { [Op.like]: term } },
              { content: { [Op.like]: term } },
            ),
          );
        }
      } else {
        const term = `%${raw}%`;
        andConditions.push(
          sequelize.or(
            { title: { [Op.like]: term } },
            { content: { [Op.like]: term } },
          ),
        );
      }
    }
    

    // Filter động từ data params (formData)
    if (formDataFilters && typeof formDataFilters === "object" && Object.keys(formDataFilters).length > 0) {
      for (const [key, value] of Object.entries(formDataFilters)) {
        // Hỗ trợ toán tử dạng suffix: field__gte, field__lte, field__ne
        // Ví dụ: formData[registration.endDate__gte]=2026-03-10
        // Lưu ý: JSON_EXTRACT trả string, so sánh theo chuỗi phù hợp ISO date (YYYY-MM-DD)
        let op = Op.eq;
        let fieldPath = key;
        const opMatch = key.match(/^(.*)__([a-z]+)$/i);
        if (opMatch) {
          fieldPath = opMatch[1];
          const opKey = opMatch[2].toLowerCase();
          if (opKey === "gte") op = Op.gte;
          else if (opKey === "lte") op = Op.lte;
          else if (opKey === "ne") op = Op.ne;
        }

        const jsonPath = "$." + fieldPath;
        // Chuỗi tự do: lọc theo chuỗi con (LIKE) thay vì khớp tuyệt đối
        let filterOp = op;
        let filterVal = value;
        if (
          fieldPath === "ageRange" &&
          op === Op.eq &&
          typeof value === "string" &&
          value.trim() !== ""
        ) {
          filterOp = Op.like;
          filterVal = `%${value.trim()}%`;
        }
        // Khu vực nhóm (formData.area.*) người dùng gõ tự do — filter gõ một phần vẫn ra
        if (
          (fieldPath === "area.city" || fieldPath === "area.district") &&
          op === Op.eq &&
          typeof value === "string" &&
          value.trim() !== ""
        ) {
          filterOp = Op.like;
          filterVal = `%${value.trim()}%`;
        }
        andConditions.push(
          sequelize.where(
            // Nếu là repost wrapper thì filter theo formData của bài gốc (repostOf.formData)
            sequelize.literal(
              `JSON_UNQUOTE(JSON_EXTRACT(COALESCE(repostOf.formData, Post.formData), '${jsonPath}'))`,
            ),
            filterOp,
            filterVal,
          ),
        );
      }
    }

    // Ẩn bài đăng lại: chỉ lấy bài gốc
    if (hideReposts) {
      andConditions.push({ repostOfPostId: { [Op.is]: null } });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const currentUserId = data.userId;
    const result = await Post.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      transaction: t,
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM PostLikes pl WHERE pl.postId = Post.id)`,
            ),
            "likesCount",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM Comments c WHERE c.postId = Post.id)`,
            ),
            "commentsCount",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id))`,
            ),
            "sharesCount",
          ],
          currentUserId
            ? [
                sequelize.literal(
                  `EXISTS (SELECT 1 FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id) AND ps.userId = ${Number(
                    currentUserId,
                  )})`,
                ),
                "sharedByMe",
              ]
            : [
                sequelize.literal("false"),
                "sharedByMe",
              ],
          currentUserId
            ? [
                sequelize.literal(
                  `EXISTS (SELECT 1 FROM PostLikes pl WHERE pl.postId = Post.id AND pl.userId = ${Number(
                    currentUserId,
                  )})`,
                ),
                "likedByMe",
              ]
            : [
                sequelize.literal("false"),
                "likedByMe",
              ],
        ],
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "email"],
          include: [
            {
              model: Profile,
              as: "profile",
              attributes: ["fullName", "avatar"],
            },
          ],
        },
        // Join bài gốc để filter formData khi post là repost
        {
          model: Post,
          as: "repostOf",
          attributes: [],
          required: false,
        },
      ],
    });

    return { total: result.count, page, limit, data: result.rows };
  });
};


// Lấy chi tiết bài đăng theo id.
const getPostByIdService = async (data) => {
  return sequelize.transaction(async (t) => {
    const currentUserId = data.userId;
    const post = await Post.findByPK(data.postId, {
      where: {  isDeleted: false },
      transaction: t,
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM PostLikes pl WHERE pl.postId = Post.id)`,
            ),
            "likesCount",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM Comments c WHERE c.postId = Post.id)`,
            ),
            "commentsCount",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id))`,
            ),
            "sharesCount",
          ],
          currentUserId
            ? [
                sequelize.literal(
                  `EXISTS (SELECT 1 FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id) AND ps.userId = ${Number(
                    currentUserId,
                  )})`,
                ),
                "sharedByMe",
              ]
            : [
                sequelize.literal("false"),
                "sharedByMe",
              ],
          currentUserId
            ? [
                sequelize.literal(
                  `EXISTS (SELECT 1 FROM PostLikes pl WHERE pl.postId = Post.id AND pl.userId = ${Number(
                    currentUserId,
                  )})`,
                ),
                "likedByMe",
              ]
            : [
                sequelize.literal("false"),
                "likedByMe",
              ],
        ],
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "email"],
          include: [
            {
              model: Profile,
              as: "profile",
              attributes: ["fullName", "avatar"],
            },
          ],
        },
      ],
    });

    if (!post) throw new NotFoundError("Không tìm thấy bài đăng.");
    return post;
  });
};

// Cập nhật bài đăng (chỉ tác giả).
const updatePostService = async (data) => {
  const { title, content, formData } = data;
  return sequelize.transaction(async (t) => {
    const post = await Post.findByPK(data.postId, {
      where: { isDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!post) throw new NotFoundError("Không tìm thấy bài đăng.");
    if (post.authorId !== data.userId) {
      throw new ForbiddenError("Bạn không có quyền chỉnh sửa bài đăng này.");
    }

    const payload = {};
    if (title !== undefined) payload.title = title?.trim();
    if (content !== undefined) payload.content = content?.trim() || null;
    if (formData !== undefined) payload.formData = formData;

    await post.update(payload, { transaction: t });

    return post;
  });
};

// Xóa bài đăng (soft-delete) - chỉ tác giả mới được xóa.
const deletePostService = async (data) => {
  const { postId, userId } = data;
  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!post) throw new NotFoundError("Không tìm thấy bài đăng.");
    if (post.authorId !== userId) {
      throw new ForbiddenError("Bạn không có quyền xóa bài đăng này.");
    }

    await post.update(
      { isDeleted: true, deletedAt: new Date() },
      { transaction: t },
    );

    return;
  });
};

const postService = {
  createPostService,
  getPostsService,
  getPostByIdService,
  updatePostService,
  deletePostService,
};

export default postService;
