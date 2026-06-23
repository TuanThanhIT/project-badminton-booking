import sequelize from "../../config/db.js";
import { Post, User, Profile, ClassRoom, PostLike } from "../../models/index.js";
import { POST_REACTION, POST_TYPE } from "../../constants/postConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import { CLASS_ENROLLMENT_STATUS } from "../../constants/classConstant.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { Op } from "sequelize";
import {
  ACCOUNT_STATUS,
  MODERATION_ACTION,
  MODERATION_LABEL,
  MODERATION_SOURCE,
  MODERATION_TARGET_TYPE,
  POST_MODERATION_STATUS,
  VIOLATION_ACTION,
} from "../../constants/moderationConstant.js";
import { buildModerationText } from "../../utils/moderationTextBuilder.js";
import {
  decideModerationAction,
  predictModerationText,
} from "../aiModerationService.js";
import {
  createViolation,
  reactivateUserIfSuspensionExpired,
} from "../moderationViolationService.js";
import {
  sendAdminNotification,
  sendUserNotification,
} from "../../helpers/notification.js";

const emptyReactionSummary = () =>
  Object.values(POST_REACTION).reduce((summary, reactionType) => {
    summary[reactionType] = 0;
    return summary;
  }, {});

const attachReactionSummaries = async (posts, transaction) => {
  const list = Array.isArray(posts) ? posts : [posts].filter(Boolean);
  if (list.length === 0) return;

  const postIds = list.map((post) => post.id);
  const rows = await PostLike.findAll({
    attributes: [
      "postId",
      "reactionType",
      [sequelize.fn("COUNT", sequelize.col("reactionType")), "count"],
    ],
    where: { postId: postIds },
    group: ["postId", "reactionType"],
    raw: true,
    transaction,
  });

  const summaryByPostId = new Map(
    postIds.map((postId) => [Number(postId), emptyReactionSummary()]),
  );

  rows.forEach((row) => {
    const postId = Number(row.postId);
    const summary = summaryByPostId.get(postId);
    if (!summary || !Object.values(POST_REACTION).includes(row.reactionType)) {
      return;
    }
    summary[row.reactionType] = Number(row.count || 0);
  });

  list.forEach((post) => {
    post.setDataValue(
      "reactionSummary",
      summaryByPostId.get(Number(post.id)) || emptyReactionSummary(),
    );
  });
};

const toUserPostPayload = (post) => {
  const payload = post?.toJSON ? post.toJSON() : post;
  if (!payload) return payload;
  delete payload.moderationText;
  return payload;
};

const toAccountLockData = (user) => ({
  accountStatus: user.accountStatus,
  suspendedUntil: user.suspendedUntil,
  suspensionReason: user.suspensionReason,
  violationCount: user.violationCount,
  forceLogout: true,
});

// Tạo bài đăng mới. Nếu type = Class thì chỉ Coach được đăng.
const assertUserCanCreatePost = (user) => {
  if (user.accountStatus === ACCOUNT_STATUS.BANNED) {
    throw new ForbiddenError(
      "Tài khoản đã bị khóa do vi phạm quy định cộng đồng.",
      toAccountLockData(user),
    );
  }

  const suspensionIsActive =
    user.accountStatus === ACCOUNT_STATUS.SUSPENDED &&
    user.suspendedUntil &&
    new Date(user.suspendedUntil).getTime() > Date.now();

  if (suspensionIsActive) {
    throw new ForbiddenError(
      `Tài khoản tạm thời bị khóa đến ${new Date(
        user.suspendedUntil,
      ).toLocaleString("vi-VN")}.`,
      toAccountLockData(user),
    );
  }
};

const createPostService = async (data) => {
  const { title, content, type, formData, userId, userRole } = data;

  if (type === POST_TYPE.CLASS && userRole !== ROLE_NAME.COACH) {
    throw new ForbiddenError(
      "Chỉ người dạy cầu lông mới được đăng bài lớp học.",
    );
  }

  let user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("Không tìm thấy người dùng.");
  }

  user = await reactivateUserIfSuspensionExpired(user);
  assertUserCanCreatePost(user);

  const moderationText = buildModerationText({
    type,
    title,
    content,
    formData,
  });

  let aiResult = null;
  let decision;

  try {
    aiResult = await predictModerationText(moderationText);
    decision = decideModerationAction(aiResult);
  } catch (error) {
    console.error("AI moderation unavailable:", error.message);
    decision = {
      action: MODERATION_ACTION.REVIEW,
      reason: "AI service unavailable",
    };
  }

  const statusByAction = {
    [MODERATION_ACTION.ALLOW]: POST_MODERATION_STATUS.APPROVED,
    [MODERATION_ACTION.REVIEW]: POST_MODERATION_STATUS.REVIEW_REQUIRED,
    [MODERATION_ACTION.BLOCK]: POST_MODERATION_STATUS.REJECTED,
  };
  const moderationStatus = statusByAction[decision.action];
  const isActive =
    moderationStatus === POST_MODERATION_STATUS.APPROVED;
  const moderationLabel = Object.values(MODERATION_LABEL).includes(
    aiResult?.label,
  )
    ? aiResult.label
    : null;
  const confidence = Number(aiResult?.confidence);
  const moderationConfidence = Number.isFinite(confidence)
    ? confidence
    : null;

  return sequelize.transaction(async (t) => {
    let lockedUser = await User.findByPk(userId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!lockedUser) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    lockedUser = await reactivateUserIfSuspensionExpired(lockedUser, t);
    assertUserCanCreatePost(lockedUser);

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
        isActive,
        isDeleted: false,
        moderationStatus,
        moderationLabel,
        moderationConfidence,
        moderationAction: decision.action,
        moderationReason: decision.reason,
        moderationText,
        moderatedAt: new Date(),
      },
      { transaction: t },
    );

    let violationResult = null;

    if (decision.action === MODERATION_ACTION.BLOCK) {
      violationResult = await createViolation(
        {
          userId,
          postId: post.id,
          targetType: MODERATION_TARGET_TYPE.POST,
          targetId: post.id,
          label: moderationLabel,
          action: VIOLATION_ACTION.BLOCK,
          confidence: moderationConfidence,
          reason: decision.reason,
          source: MODERATION_SOURCE.AI,
        },
        { transaction: t },
      );
    }

    if (decision.action === MODERATION_ACTION.REVIEW) {
      await sendUserNotification(
        userId,
        "POST_MODERATION_REVIEW_REQUIRED",
        "Bài viết đang chờ duyệt",
        `Bài viết "${post.title}" đang chờ quản trị viên duyệt trước khi hiển thị.`,
        { transaction: t },
      );

      await sendAdminNotification(
        "POST_MODERATION_REVIEW",
        "Có bài viết cần kiểm duyệt",
        `Bài viết "${post.title}" đang chờ duyệt: ${decision.reason}`,
        { transaction: t },
      );
    }

    if (decision.action === MODERATION_ACTION.BLOCK) {
      await sendUserNotification(
        userId,
        "POST_MODERATION_REJECTED",
        "Bài viết bị từ chối",
        `Bài viết "${post.title}" bị từ chối do: ${decision.reason}.`,
        { transaction: t },
      );

      await sendAdminNotification(
        "POST_MODERATION_REJECTED",
        "AI đã từ chối một bài viết",
        `Bài viết "${post.title}" bị từ chối: ${decision.reason}`,
        { transaction: t },
      );
    }

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

    return {
      post: toUserPostPayload(created),
      moderation: {
        status: moderationStatus,
        label: moderationLabel,
        confidence: moderationConfidence,
        action: decision.action,
        reason: decision.reason,
      },
      violation: violationResult
        ? {
            violationCount: violationResult.violationCount || 0,
            accountStatus: violationResult.accountStatus || null,
            lastViolationAt: violationResult.lastViolationAt || null,
            suspendedUntil: violationResult.suspendedUntil || null,
            suspensionReason: violationResult.suspensionReason || null,
            forceLogout: violationResult.forceLogout,
            statusChanged: violationResult.statusChanged,
          }
        : null,
      forceLogout: Boolean(violationResult?.forceLogout),
    };
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
              `(SELECT COUNT(*) FROM Comments c WHERE c.postId = Post.id AND c.isDeleted = false)`,
            ),
            "commentsCount",
          ],
          [
            sequelize.literal(
              `GREATEST(
                (SELECT COUNT(*) FROM Posts rp WHERE rp.repostOfPostId = IFNULL(Post.repostOfPostId, Post.id) AND rp.isDeleted = false),
                (SELECT COUNT(*) FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id))
              )`,
            ),
            "sharesCount",
          ],
          currentUserId
            ? [
                sequelize.literal(
                  `(EXISTS (SELECT 1 FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id) AND ps.userId = ${Number(
                    currentUserId,
                  )})
                  OR EXISTS (SELECT 1 FROM Posts rp WHERE rp.repostOfPostId = IFNULL(Post.repostOfPostId, Post.id) AND rp.authorId = ${Number(
                    currentUserId,
                  )} AND rp.isDeleted = false))`,
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
          currentUserId
            ? [
                sequelize.literal(
                  `(SELECT pl.reactionType FROM PostLikes pl WHERE pl.postId = Post.id AND pl.userId = ${Number(
                    currentUserId,
                  )} LIMIT 1)`,
                ),
                "reactionByMe",
              ]
            : [
                sequelize.literal("NULL"),
                "reactionByMe",
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

    await attachReactionSummaries(result.rows, t);
    return { total: result.count, page, limit, data: result.rows };
  });
};


// Lấy chi tiết bài đăng theo id.
const getPostByIdService = async (data) => {
  return sequelize.transaction(async (t) => {
    const currentUserId = data.userId;
    const post = await Post.findOne({
      where: { id: data.postId, isDeleted: false },
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
              `(SELECT COUNT(*) FROM Comments c WHERE c.postId = Post.id AND c.isDeleted = false)`,
            ),
            "commentsCount",
          ],
          [
            sequelize.literal(
              `GREATEST(
                (SELECT COUNT(*) FROM Posts rp WHERE rp.repostOfPostId = IFNULL(Post.repostOfPostId, Post.id) AND rp.isDeleted = false),
                (SELECT COUNT(*) FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id))
              )`,
            ),
            "sharesCount",
          ],
          currentUserId
            ? [
                sequelize.literal(
                  `(EXISTS (SELECT 1 FROM PostShares ps WHERE ps.postId = IFNULL(Post.repostOfPostId, Post.id) AND ps.userId = ${Number(
                    currentUserId,
                  )})
                  OR EXISTS (SELECT 1 FROM Posts rp WHERE rp.repostOfPostId = IFNULL(Post.repostOfPostId, Post.id) AND rp.authorId = ${Number(
                    currentUserId,
                  )} AND rp.isDeleted = false))`,
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
          currentUserId
            ? [
                sequelize.literal(
                  `(SELECT pl.reactionType FROM PostLikes pl WHERE pl.postId = Post.id AND pl.userId = ${Number(
                    currentUserId,
                  )} LIMIT 1)`,
                ),
                "reactionByMe",
              ]
            : [
                sequelize.literal("NULL"),
                "reactionByMe",
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
    await attachReactionSummaries(post, t);
    return post;
  });
};

// Cập nhật bài đăng (chỉ tác giả).
const updatePostService = async (data) => {
  const { title, content, formData } = data;
  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: data.postId, isDeleted: false },
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
