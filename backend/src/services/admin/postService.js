import { Op, literal } from "sequelize";
import { Post, Comment, User, Profile } from "../../models/index.js";
import { POST_TYPE } from "../../constants/postConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import sequelize from "../../config/db.js";
import {
  MODERATION_ACTION,
  MODERATION_LABEL,
  MODERATION_SOURCE,
  MODERATION_TARGET_TYPE,
  POST_MODERATION_STATUS,
  VIOLATION_ACTION,
} from "../../constants/moderationConstant.js";
import { createViolation } from "../moderationViolationService.js";

const getAdminPostsService = async (data) => {
  const {
    page = 1,
    limit = 10,
    search,
    keyword,
    type,
    isActive,
    isDeleted,
    moderationStatus,
    moderationLabel,
  } = data;
  const offset = (page - 1) * limit;

  const where = {};
  const searchTerm = search || keyword;
  if (searchTerm) {
    where[Op.or] = [
      { title: { [Op.like]: `%${searchTerm}%` } },
      { content: { [Op.like]: `%${searchTerm}%` } },
      { "$author.username$": { [Op.like]: `%${searchTerm}%` } },
      { "$author.profile.fullName$": { [Op.like]: `%${searchTerm}%` } },
    ];
  }
  if (type) where.type = type;
  if (moderationStatus) where.moderationStatus = moderationStatus;
  if (moderationLabel) where.moderationLabel = moderationLabel;
  if (isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true" || isActive === true;
  }
  if (isDeleted !== undefined && isDeleted !== "") {
    where.isDeleted = isDeleted === "true" || isDeleted === true;
  }

  const { rows, count } = await Post.findAndCountAll({
    where,
    attributes: [
      "id", "title", "type", "content", "isActive", "isDeleted", "isRepost", "deletedAt", "createdAt",
      "moderationStatus", "moderationLabel", "moderationConfidence", "moderationAction", "moderationReason", "moderatedAt",
      [literal("(SELECT COUNT(*) FROM `Comments` WHERE `Comments`.`postId` = `Post`.`id`)"), "commentCount"],
    ],
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username"],
        include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const posts = rows.map((p) => {
    const post = p.toJSON();
    return {
      id: post.id,
      title: post.title,
      type: post.type,
      content: post.content,
      isActive: post.isActive,
      isDeleted: post.isDeleted,
      isRepost: post.isRepost,
      deletedAt: post.deletedAt,
      createdAt: post.createdAt,
      moderationStatus: post.moderationStatus,
      moderationLabel: post.moderationLabel,
      moderationConfidence: post.moderationConfidence,
      moderationAction: post.moderationAction,
      moderationReason: post.moderationReason,
      moderatedAt: post.moderatedAt,
      commentCount: Number(post.commentCount || 0),
      authorId: post.author?.id,
      authorUsername: post.author?.username,
      authorName: post.author?.profile?.fullName,
      authorAvatar: post.author?.profile?.avatar,
    };
  });

  return { posts, pagination: { page: Number(page), limit: Number(limit), total: count } };
};

const toggleAdminPostActiveService = async (postId) => {
  const post = await Post.findByPk(postId);
  if (!post) throw new NotFoundError("Không tìm thấy bài đăng");

  await post.update({ isActive: !post.isActive });
  return { id: post.id, isActive: post.isActive };
};

const deleteAdminPostService = async (postId) => {
  const post = await Post.findByPk(postId);
  if (!post) throw new NotFoundError("Không tìm thấy bài đăng");

  await post.update({ isDeleted: true, deletedAt: new Date(), isActive: false });
  return { id: Number(postId) };
};

const getAdminCommentsService = async (data) => {
  const { page = 1, limit = 10, search, postId, commentType, postType } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) where.content = { [Op.like]: `%${search}%` };
  if (postId) where.postId = postId;
  if (commentType) where.type = commentType;

  const { rows, count } = await Comment.findAndCountAll({
    where,
    attributes: ["id", "content", "type", "postId", "parentId", "createdAt"],
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username"],
        include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
      },
      {
        model: Post,
        as: "post",
        attributes: ["id", "title", "type"],
        where: postType ? { type: postType } : undefined,
        required: !!postType,
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
  });

  const comments = rows.map((c) => {
    const comment = c.toJSON();
    return {
      id: comment.id,
      content: comment.content,
      type: comment.type,
      postId: comment.postId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      authorId: comment.author?.id,
      authorUsername: comment.author?.username,
      authorName: comment.author?.profile?.fullName,
      authorAvatar: comment.author?.profile?.avatar,
      postTitle: comment.post?.title,
      postType: comment.post?.type,
    };
  });

  return { comments, pagination: { page: Number(page), limit: Number(limit), total: count } };
};

const deleteAdminCommentService = async (commentId) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new NotFoundError("Không tìm thấy bình luận");

  await comment.destroy();
  return { id: Number(commentId) };
};

const getPendingModerationPostsService = async ({
  page = 1,
  limit = 20,
  moderationLabel,
  type,
  keyword,
}) => {
  const normalizedPage = Number(page);
  const normalizedLimit = Number(limit);
  const offset = (normalizedPage - 1) * normalizedLimit;

  const where = {
      moderationStatus: POST_MODERATION_STATUS.REVIEW_REQUIRED,
      isDeleted: false,
    };
  if (moderationLabel) where.moderationLabel = moderationLabel;
  if (type) where.type = type;
  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { content: { [Op.like]: `%${keyword}%` } },
      { "$author.username$": { [Op.like]: `%${keyword}%` } },
      { "$author.profile.fullName$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const { rows, count } = await Post.findAndCountAll({
    where,
    attributes: [
      "id",
      "title",
      "content",
      "type",
      "formData",
      "isActive",
      "moderationStatus",
      "moderationLabel",
      "moderationConfidence",
      "moderationAction",
      "moderationReason",
      "moderationText",
      "moderatedAt",
      "createdAt",
    ],
    include: [
      {
        model: User,
        as: "author",
        attributes: [
          "id",
          "username",
          "email",
          "accountStatus",
          "violationCount",
          "lastViolationAt",
          "suspendedUntil",
          "suspensionReason",
        ],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "avatar"],
          },
        ],
      },
    ],
    order: [["createdAt", "ASC"]],
    limit: normalizedLimit,
    offset,
    distinct: true,
  });

  return {
    posts: rows,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total: count,
    },
  };
};

const getPostModerationDetailService = async (postId) => {
  const post = await Post.findByPk(postId, {
    include: [
      {
        model: User,
        as: "author",
        attributes: [
          "id",
          "username",
          "email",
          "accountStatus",
          "violationCount",
          "lastViolationAt",
          "suspendedUntil",
          "suspensionReason",
        ],
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

  if (!post) {
    throw new NotFoundError("Không tìm thấy bài đăng.");
  }

  return post;
};

const approveModerationPostService = async (postId, { reason } = {}) =>
  sequelize.transaction(async (t) => {
    const post = await Post.findByPk(postId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!post) {
      throw new NotFoundError("Không tìm thấy bài đăng.");
    }

    if (
      post.moderationStatus !==
      POST_MODERATION_STATUS.REVIEW_REQUIRED
    ) {
      throw new BadRequestError(
        "Bài đăng không ở trạng thái chờ duyệt.",
      );
    }

    await post.update(
      {
        moderationStatus: POST_MODERATION_STATUS.APPROVED,
        moderationAction: MODERATION_ACTION.ALLOW,
        moderationReason:
          reason?.trim() || "Quản trị viên đã duyệt bài viết.",
        moderatedAt: new Date(),
        isActive: true,
      },
      { transaction: t },
    );

    return post;
  });

const rejectModerationPostService = async (
  postId,
  { reason, label } = {},
) =>
  sequelize.transaction(async (t) => {
    const post = await Post.findByPk(postId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!post) {
      throw new NotFoundError("Không tìm thấy bài đăng.");
    }

    if (
      post.moderationStatus !==
      POST_MODERATION_STATUS.REVIEW_REQUIRED
    ) {
      throw new BadRequestError(
        "Bài đăng không ở trạng thái chờ duyệt.",
      );
    }

    const violationLabels = [
      MODERATION_LABEL.SPAM,
      MODERATION_LABEL.UNAUTHORIZED_AD,
      MODERATION_LABEL.OFFENSIVE,
    ];
    const violationLabel = label || post.moderationLabel;

    if (!violationLabels.includes(violationLabel)) {
      throw new BadRequestError(
        "Cần chọn nhãn vi phạm: spam, unauthorized_ad hoặc offensive.",
      );
    }

    const moderationReason =
      reason?.trim() ||
      "Quản trị viên từ chối bài viết do vi phạm quy định cộng đồng.";

    await post.update(
      {
        moderationStatus: POST_MODERATION_STATUS.REJECTED,
        moderationLabel: violationLabel,
        moderationAction: MODERATION_ACTION.BLOCK,
        moderationReason,
        moderatedAt: new Date(),
        isActive: false,
      },
      { transaction: t },
    );

    const violationResult = await createViolation(
      {
        userId: post.authorId,
        postId: post.id,
        targetType: MODERATION_TARGET_TYPE.POST,
        targetId: post.id,
        label: violationLabel,
        action: VIOLATION_ACTION.ADMIN_REJECTED,
        confidence: post.moderationConfidence,
        reason: moderationReason,
        source: MODERATION_SOURCE.ADMIN,
      },
      { transaction: t },
    );

    return {
      post,
      violation: {
        violationCount: violationResult.violationCount,
        accountStatus: violationResult.accountStatus,
        suspendedUntil: violationResult.suspendedUntil,
        suspensionReason: violationResult.suspensionReason,
        forceLogout: violationResult.forceLogout,
        statusChanged: violationResult.statusChanged,
      },
      forceLogout: violationResult.forceLogout,
    };
  });

const adminPostService = {
  getAdminPostsService,
  toggleAdminPostActiveService,
  deleteAdminPostService,
  getAdminCommentsService,
  deleteAdminCommentService,
  getPendingModerationPostsService,
  getPostModerationDetailService,
  approveModerationPostService,
  rejectModerationPostService,
};

export default adminPostService;
