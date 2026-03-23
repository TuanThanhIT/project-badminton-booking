import sequelize from "../../config/db.js";
import { Post, User, Profile } from "../../models/index.js";
import { POST_TYPE } from "../../constants/postConstant.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { Op } from "sequelize";

// Tạo bài đăng mới. Nếu type = Class thì chỉ Coach được đăng.
const createPostService = async (data, currentUser) => {
  const { title, content, type, formData } = data;

  // Rule: chỉ Coach được đăng lớp học
  if (type === POST_TYPE.CLASS && currentUser.role !== "Coach") {
    throw new ForbiddenError("Chỉ huấn luyện viên mới được đăng bài lớp học.");
  }

  return sequelize.transaction(async (t) => {
    const post = await Post.create(
      {
        authorId: currentUser.id,
        type,
        title: title?.trim(),
        content: content?.trim() || null,
        formData: formData || null,
        isActive: true,
        isDeleted: false,
      },
      { transaction: t },
    );

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

// Lấy danh sách bài đăng (phân trang + filter theo type).
// const getPostsService = async (query) => {
//   const page = Number(query.page || 1);
//   const limit = Number(query.limit || 10);
//   const offset = (page - 1) * limit;
//   const type = query.type;

//   return sequelize.transaction(async (t) => {
//     const where = { isDeleted: false, isActive: true };
//     if (type) where.type = type;

//     const result = await Post.findAndCountAll({
//       where,
//       limit,
//       offset,
//       order: [["createdDate", "DESC"]],
//       transaction: t,
//       include: [
//         {
//           model: User,
//           as: "author",
//           attributes: ["id", "username"],
//           include: [
//             {
//               model: Profile,
//               as: "profile",
//               attributes: ["fullName", "avatar"],
//             },
//           ],
//         },
//       ],
//     });

//     return {
//       total: result.count,
//       page,
//       limit,
//       data: result.rows,
//     };
//   });
// };
const getPostsService = async (query) => {
  // Tự động gom các key dạng formData[location.branchId]=4 thành object filter động
  let formDataFilters = {};
  for (const [key, value] of Object.entries(query)) {
    const match = key.match(/^formData\[(.+)\]$/);
    if (match) {
      formDataFilters[match[1]] = value;
    }
  }
  // Nếu không có key dạng formData[...], fallback về query.formData nếu là object (hỗ trợ filter truyền thẳng object)
  if (Object.keys(formDataFilters).length === 0 && typeof query.formData === 'object') {
    // flatten object nếu là { location: { branchId: 4 } } thành { 'location.branchId': 4 }
    const flatten = (obj, prefix = '') =>
      Object.entries(obj).reduce((acc, [k, v]) => {
        const pre = prefix ? prefix + '.' : '';
        if (typeof v === 'object' && v !== null) Object.assign(acc, flatten(v, pre + k));
        else acc[pre + k] = v;
        return acc;
      }, {});
    formDataFilters = flatten(query.formData);
  }
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const offset = (page - 1) * limit;
  const type = query.type;
  const search = query.search || query.q;

  return sequelize.transaction(async (t) => {
    const where = { isDeleted: false, isActive: true };
    if (type) where.type = type;

    const andConditions = [];

    // Tìm kiếm theo tiêu đề hoặc nội dung
    if (search && typeof search === "string" && search.trim()) {
      const term = `%${search.trim()}%`;
      andConditions.push(
        sequelize.or(
          { title: { [Op.like]: term } },
          { content: { [Op.like]: term } }
        )
      );
    }

    // Filter động từ query params (formData)
    if (formDataFilters && typeof formDataFilters === "object" && Object.keys(formDataFilters).length > 0) {
      for (const [key, value] of Object.entries(formDataFilters)) {
        const jsonPath = "$." + key;
        andConditions.push(
          sequelize.where(
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(formData, '${jsonPath}'))`),
            Op.eq,
            value
          )
        );
      }
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const result = await Post.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdDate", "DESC"]],
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

    return { total: result.count, page, limit, data: result.rows };
  });
};


// Lấy chi tiết bài đăng theo id.
const getPostByIdService = async (postId) => {
  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username"],
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
const updatePostService = async (postId, data, currentUser) => {
  const { title, content, formData } = data;

  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!post) throw new NotFoundError("Không tìm thấy bài đăng.");
    if (post.authorId !== currentUser.id) {
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
const deletePostService = async (postId, currentUser) => {
  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!post) throw new NotFoundError("Không tìm thấy bài đăng.");
    if (post.authorId !== currentUser.id) {
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