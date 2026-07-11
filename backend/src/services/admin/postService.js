import { Op, literal, QueryTypes } from "sequelize";
import {
  Post,
  Comment,
  CommentReport,
  User,
  Profile,
} from "../../models/index.js";
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
import {
  COMMENT_REPORT_REASON,
  COMMENT_REPORT_STATUS,
} from "../../constants/commentReportConstant.js";
import { createViolation } from "../moderationViolationService.js";
import { sendUserNotification } from "../../helpers/notification.js";

const buildDateRange = (startDate, endDate) => {
  const range = {};
  if (startDate) {
    range[Op.gte] = new Date(`${startDate}T00:00:00`);
  }
  if (endDate) {
    range[Op.lte] = new Date(`${endDate}T23:59:59.999`);
  }
  return Reflect.ownKeys(range).length ? range : null;
};

const getDefaultAnalyticsRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const resolveAnalyticsRange = ({ startDate, endDate } = {}) => {
  if (startDate && endDate) return { startDate, endDate };
  return getDefaultAnalyticsRange();
};

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
    startDate,
    endDate,
  } = data;
  const offset = (page - 1) * limit;

  const where = {};
  const searchTerm = String(search || keyword || "").trim();
  const usernameSearchTerm = searchTerm.replace(/^@+/, "");
  if (searchTerm) {
    where[Op.or] = [
      { title: { [Op.like]: `%${searchTerm}%` } },
      { content: { [Op.like]: `%${searchTerm}%` } },
      { "$author.username$": { [Op.like]: `%${usernameSearchTerm || searchTerm}%` } },
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
  const createdAtRange = buildDateRange(startDate, endDate);
  if (createdAtRange) where.createdAt = createdAtRange;

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

const getAdminPostAnalyticsService = async (data = {}) => {
  const { startDate, endDate } = resolveAnalyticsRange(data);
  const startAt = new Date(`${startDate}T00:00:00`);
  const endAt = new Date(`${endDate}T23:59:59.999`);
  const replacements = { startAt, endAt };

  const [typeRows, featuredRows] = await Promise.all([
    sequelize.query(
      `
        SELECT
          p.type,
          COUNT(DISTINCT p.id) AS totalPosts,
          COUNT(DISTINCT CASE WHEN p.isActive = 1 AND p.isDeleted = 0 THEN p.id END) AS activePosts,
          COUNT(DISTINCT CASE WHEN p.isActive = 0 AND p.isDeleted = 0 THEN p.id END) AS hiddenPosts,
          COUNT(DISTINCT CASE WHEN p.moderationStatus = :reviewStatus AND p.isDeleted = 0 THEN p.id END) AS reviewRequiredPosts,
          COUNT(DISTINCT c.id) AS commentCount,
          COUNT(DISTINCT cr.id) AS reportCount
        FROM Posts p
        LEFT JOIN Comments c
          ON c.postId = p.id
         AND c.createdAt BETWEEN :startAt AND :endAt
        LEFT JOIN CommentReports cr
          ON cr.commentId = c.id
         AND cr.createdAt BETWEEN :startAt AND :endAt
        WHERE p.createdAt BETWEEN :startAt AND :endAt
          AND p.isDeleted = 0
        GROUP BY p.type
        ORDER BY totalPosts DESC, p.type ASC
      `,
      {
        replacements: {
          ...replacements,
          reviewStatus: POST_MODERATION_STATUS.REVIEW_REQUIRED,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT *
        FROM (
          SELECT
            p.id,
            p.title,
            p.type,
            p.content,
            p.isActive,
            p.isDeleted,
            p.createdAt,
            p.moderationStatus,
            p.moderationLabel,
            p.moderationConfidence,
            p.moderationReason,
            u.username AS authorUsername,
            pr.fullName AS authorName,
            (
              SELECT COUNT(*)
              FROM Comments c
              WHERE c.postId = p.id
                AND c.createdAt BETWEEN :startAt AND :endAt
            ) AS commentCount,
            (
              SELECT COUNT(*)
              FROM Comments c
              INNER JOIN CommentReports cr ON cr.commentId = c.id
              WHERE c.postId = p.id
                AND cr.createdAt BETWEEN :startAt AND :endAt
            ) AS reportCount,
            (
              (
                SELECT COUNT(*)
                FROM Comments c
                WHERE c.postId = p.id
                  AND c.createdAt BETWEEN :startAt AND :endAt
              ) * 3
              +
              (
                SELECT COUNT(*)
                FROM Comments c
                INNER JOIN CommentReports cr ON cr.commentId = c.id
                WHERE c.postId = p.id
                  AND cr.createdAt BETWEEN :startAt AND :endAt
              ) * 5
              + CASE WHEN p.moderationStatus = :reviewStatus THEN 4 ELSE 0 END
              + CASE WHEN p.isActive = 0 THEN 2 ELSE 0 END
            ) AS hotScore
          FROM Posts p
          INNER JOIN Users u ON u.id = p.authorId
          LEFT JOIN Profiles pr ON pr.userId = u.id
          WHERE p.createdAt BETWEEN :startAt AND :endAt
            AND p.isDeleted = 0
        ) featured
        ORDER BY featured.hotScore DESC, featured.createdAt DESC
        LIMIT 10
      `,
      {
        replacements: {
          ...replacements,
          reviewStatus: POST_MODERATION_STATUS.REVIEW_REQUIRED,
        },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const typeBreakdown = typeRows.map((row) => ({
    type: row.type,
    totalPosts: Number(row.totalPosts) || 0,
    activePosts: Number(row.activePosts) || 0,
    hiddenPosts: Number(row.hiddenPosts) || 0,
    reviewRequiredPosts: Number(row.reviewRequiredPosts) || 0,
    commentCount: Number(row.commentCount) || 0,
    reportCount: Number(row.reportCount) || 0,
  }));

  const featuredPosts = featuredRows.map((row) => ({
    id: Number(row.id),
    title: row.title,
    type: row.type,
    content: row.content,
    isActive: Boolean(row.isActive),
    isDeleted: Boolean(row.isDeleted),
    createdAt: row.createdAt,
    moderationStatus: row.moderationStatus,
    moderationLabel: row.moderationLabel,
    moderationConfidence:
      row.moderationConfidence != null ? Number(row.moderationConfidence) : null,
    moderationReason: row.moderationReason,
    authorUsername: row.authorUsername,
    authorName: row.authorName,
    commentCount: Number(row.commentCount) || 0,
    reportCount: Number(row.reportCount) || 0,
    hotScore: Number(row.hotScore) || 0,
  }));

  return {
    period: { startDate, endDate },
    typeBreakdown,
    featuredPosts,
    summary: {
      totalPosts: typeBreakdown.reduce((sum, row) => sum + row.totalPosts, 0),
      totalComments: typeBreakdown.reduce((sum, row) => sum + row.commentCount, 0),
      totalReports: typeBreakdown.reduce((sum, row) => sum + row.reportCount, 0),
      typeCount: typeBreakdown.length,
      featuredCount: featuredPosts.length,
    },
  };
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
  const {
    page = 1,
    limit = 10,
    search,
    postId,
    commentType,
    postType,
    isActive,
    isDeleted,
    reportFilter,
    startDate,
    endDate,
  } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) where.content = { [Op.like]: `%${search}%` };
  if (postId) where.postId = postId;
  if (commentType) where.type = commentType;
  if (isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true" || isActive === true;
  }
  if (isDeleted !== undefined && isDeleted !== "") {
    where.isDeleted = isDeleted === "true" || isDeleted === true;
  }
  if (reportFilter === "REPORTED") {
    where.reportCount = { [Op.gt]: 0 };
  }
  if (reportFilter === "UNREPORTED") {
    where[Op.or] = [{ reportCount: 0 }, { reportCount: null }];
  }
  if (reportFilter === "AUTO_HIDDEN") {
    where.autoHiddenByReports = true;
  }
  if (reportFilter === "HIDDEN") {
    where.isActive = false;
  }
  const createdAtRange = buildDateRange(startDate, endDate);
  if (createdAtRange) where.createdAt = createdAtRange;

  const includePendingReport = reportFilter === "PENDING_REPORT";

  const { rows, count } = await Comment.findAndCountAll({
    where,
    attributes: [
      "id",
      "content",
      "type",
      "postId",
      "parentId",
      "isActive",
      "isDeleted",
      "reportCount",
      "autoHiddenByReports",
      "hiddenReason",
      "hiddenAt",
      "createdAt",
    ],
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
      ...(includePendingReport
        ? [
            {
              model: CommentReport,
              as: "reports",
              attributes: ["id", "status"],
              where: { status: COMMENT_REPORT_STATUS.PENDING },
              required: true,
            },
          ]
        : []),
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const comments = rows.map((c) => {
    const comment = c.toJSON();
    return {
      id: comment.id,
      content: comment.content,
      type: comment.type,
      postId: comment.postId,
      parentId: comment.parentId,
      isActive: comment.isActive,
      isDeleted: comment.isDeleted,
      reportCount: comment.reportCount,
      autoHiddenByReports: comment.autoHiddenByReports,
      hiddenReason: comment.hiddenReason,
      hiddenAt: comment.hiddenAt,
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

const softDeleteAdminCommentService = async (commentId, options = {}) =>
  sequelize.transaction(async (t) => {
    const comment = await Comment.findByPk(commentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!comment) throw new NotFoundError("Không tìm thấy bình luận.");

    const reason =
      options.reason?.trim() || "Quản trị viên đã xóa bình luận vì vi phạm.";
    await comment.update(
      {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
        hiddenReason: reason,
        hiddenAt: comment.hiddenAt || new Date(),
      },
      { transaction: t },
    );

    await CommentReport.update(
      {
        status: COMMENT_REPORT_STATUS.RESOLVED,
        handledBy: options.adminId || null,
        handledAt: new Date(),
        adminNote: reason,
      },
      {
        where: { commentId, status: COMMENT_REPORT_STATUS.PENDING },
        transaction: t,
      },
    );

    await sendUserNotification(
      comment.authorId,
      "COMMENT_DELETED_BY_ADMIN",
      "Bình luận đã bị xóa",
      reason,
      { transaction: t },
    );

    return { id: Number(commentId) };
  });

const buildReportSummary = (reports = []) => {
  const byReason = Object.values(COMMENT_REPORT_REASON).reduce((acc, reason) => {
    acc[reason] = 0;
    return acc;
  }, {});
  const byStatus = Object.values(COMMENT_REPORT_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  reports.forEach((report) => {
    byReason[report.reason] = (byReason[report.reason] || 0) + 1;
    byStatus[report.status] = (byStatus[report.status] || 0) + 1;
  });

  return { byReason, byStatus };
};

const getCommentReportsService = async (data) => {
  const {
    page = 1,
    limit = 10,
    status,
    reason,
    keyword,
    search,
    autoHidden,
    startDate,
    endDate,
  } = data;
  const normalizedPage = Number(page);
  const normalizedLimit = Number(limit);
  const offset = (normalizedPage - 1) * normalizedLimit;
  const searchTerm = search || keyword;

  const where = {};
  if (autoHidden !== undefined && autoHidden !== "") {
    where.autoHiddenByReports = autoHidden === "true" || autoHidden === true;
  }
  if (searchTerm) {
    where.content = { [Op.like]: `%${searchTerm}%` };
  }

  const reportWhere = {};
  if (status) reportWhere.status = status;
  if (reason) reportWhere.reason = reason;
  const reportCreatedAtRange = buildDateRange(startDate, endDate);
  if (reportCreatedAtRange) reportWhere.createdAt = reportCreatedAtRange;

  const { rows, count } = await Comment.findAndCountAll({
    where,
    attributes: [
      "id",
      "content",
      "type",
      "postId",
      "parentId",
      "isActive",
      "isDeleted",
      "reportCount",
      "autoHiddenByReports",
      "hiddenReason",
      "hiddenAt",
      "createdAt",
    ],
    include: [
      {
        model: CommentReport,
        as: "reports",
        where: reportWhere,
        required: true,
        include: [
          {
            model: User,
            as: "reporter",
            attributes: ["id", "username"],
            include: [
              {
                model: Profile,
                as: "profile",
                attributes: ["fullName", "avatar"],
              },
            ],
          },
          {
            model: User,
            as: "handler",
            attributes: ["id", "username"],
          },
        ],
      },
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "email"],
        include: [
          { model: Profile, as: "profile", attributes: ["fullName", "avatar"] },
        ],
      },
      {
        model: Post,
        as: "post",
        attributes: ["id", "title", "type"],
      },
    ],
    order: [
      [{ model: CommentReport, as: "reports" }, "createdAt", "DESC"],
      ["createdAt", "DESC"],
    ],
    limit: normalizedLimit,
    offset,
    distinct: true,
  });

  const commentReports = rows.map((row) => {
    const comment = row.toJSON();
    const reports = comment.reports || [];
    const summary = buildReportSummary(reports);
    const latestReport = reports
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return {
      id: comment.id,
      content: comment.content,
      type: comment.type,
      postId: comment.postId,
      parentId: comment.parentId,
      isActive: comment.isActive,
      isDeleted: comment.isDeleted,
      reportCount: Number(comment.reportCount || reports.length || 0),
      autoHiddenByReports: comment.autoHiddenByReports,
      hiddenReason: comment.hiddenReason,
      hiddenAt: comment.hiddenAt,
      createdAt: comment.createdAt,
      authorId: comment.author?.id,
      authorUsername: comment.author?.username,
      authorName: comment.author?.profile?.fullName,
      authorAvatar: comment.author?.profile?.avatar,
      postTitle: comment.post?.title,
      postType: comment.post?.type,
      reportSummary: summary,
      latestReport,
      reports,
    };
  });

  return {
    commentReports,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total: count,
    },
  };
};

const rejectCommentReportService = async (reportId, { adminId, adminNote } = {}) =>
  sequelize.transaction(async (t) => {
    const report = await CommentReport.findByPk(reportId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!report) throw new NotFoundError("Không tìm thấy báo cáo bình luận.");

    await report.update(
      {
        status: COMMENT_REPORT_STATUS.REJECTED,
        handledBy: adminId || null,
        handledAt: new Date(),
        adminNote: adminNote?.trim() || "Báo cáo không đủ cơ sở xử lý.",
      },
      { transaction: t },
    );

    return report;
  });

const hideCommentService = async (commentId, { adminId, reason } = {}) =>
  sequelize.transaction(async (t) => {
    const comment = await Comment.findByPk(commentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!comment) throw new NotFoundError("Không tìm thấy bình luận.");

    const hiddenReason =
      reason?.trim() || "Quản trị viên đã ẩn bình luận vì vi phạm.";
    await comment.update(
      {
        isActive: false,
        hiddenReason,
        hiddenAt: new Date(),
      },
      { transaction: t },
    );

    await CommentReport.update(
      {
        status: COMMENT_REPORT_STATUS.RESOLVED,
        handledBy: adminId || null,
        handledAt: new Date(),
        adminNote: hiddenReason,
      },
      {
        where: { commentId, status: COMMENT_REPORT_STATUS.PENDING },
        transaction: t,
      },
    );

    await sendUserNotification(
      comment.authorId,
      "COMMENT_HIDDEN_BY_ADMIN",
      "Bình luận đã bị ẩn",
      hiddenReason,
      { transaction: t },
    );

    return { id: Number(commentId), isActive: false };
  });

const unhideCommentService = async (commentId, { adminId, reason } = {}) =>
  sequelize.transaction(async (t) => {
    const comment = await Comment.findByPk(commentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!comment) throw new NotFoundError("Không tìm thấy bình luận.");
    if (comment.isDeleted) {
      throw new BadRequestError("Không thể hiện lại bình luận đã bị xóa.");
    }

    await comment.update(
      {
        isActive: true,
        autoHiddenByReports: false,
        hiddenReason: null,
        hiddenAt: null,
      },
      { transaction: t },
    );

    await CommentReport.update(
      {
        status: COMMENT_REPORT_STATUS.REJECTED,
        handledBy: adminId || null,
        handledAt: new Date(),
        adminNote: reason?.trim() || "Quản trị viên đã hiện lại bình luận.",
      },
      {
        where: { commentId, status: COMMENT_REPORT_STATUS.PENDING },
        transaction: t,
      },
    );

    await sendUserNotification(
      comment.authorId,
      "COMMENT_RESTORED_BY_ADMIN",
      "Bình luận đã được hiện lại",
      reason?.trim() || "Quản trị viên đã xem xét và hiện lại bình luận của bạn.",
      { transaction: t },
    );

    return { id: Number(commentId), isActive: true };
  });

const warnCommentAuthorService = (
  commentId,
  { adminId, reason, label } = {},
) =>
  sequelize.transaction(async (t) => {
    const comment = await Comment.findByPk(commentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!comment) throw new NotFoundError("Không tìm thấy bình luận.");

    const allowedLabels = [
      MODERATION_LABEL.SPAM,
      MODERATION_LABEL.UNAUTHORIZED_AD,
      MODERATION_LABEL.OFFENSIVE,
    ];
    const violationLabel = allowedLabels.includes(label)
      ? label
      : MODERATION_LABEL.OFFENSIVE;
    const violationReason =
      reason?.trim() ||
      "Quản trị viên cảnh báo tác giả do bình luận vi phạm quy định cộng đồng.";

    const violationResult = await createViolation(
      {
        userId: comment.authorId,
        postId: comment.postId,
        targetType: MODERATION_TARGET_TYPE.COMMENT,
        targetId: comment.id,
        label: violationLabel,
        action: VIOLATION_ACTION.ADMIN_REJECTED,
        confidence: null,
        reason: violationReason,
        source: MODERATION_SOURCE.ADMIN,
      },
      { transaction: t },
    );

    await CommentReport.update(
      {
        status: COMMENT_REPORT_STATUS.RESOLVED,
        handledBy: adminId || null,
        handledAt: new Date(),
        adminNote: violationReason,
      },
      {
        where: { commentId, status: COMMENT_REPORT_STATUS.PENDING },
        transaction: t,
      },
    );

    await sendUserNotification(
      comment.authorId,
      "COMMENT_AUTHOR_WARNING",
      "Cảnh báo bình luận vi phạm",
      violationReason,
      { transaction: t },
    );

    return {
      id: Number(commentId),
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

const getPendingModerationPostsService = async ({
  page = 1,
  limit = 20,
  moderationLabel,
  type,
  keyword,
  startDate,
  endDate,
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
  const createdAtRange = buildDateRange(startDate, endDate);
  if (createdAtRange) where.createdAt = createdAtRange;
  const trimmedKeyword = String(keyword || "").trim();
  const usernameKeyword = trimmedKeyword.replace(/^@+/, "");
  if (trimmedKeyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${trimmedKeyword}%` } },
      { content: { [Op.like]: `%${trimmedKeyword}%` } },
      { "$author.username$": { [Op.like]: `%${usernameKeyword || trimmedKeyword}%` } },
      { "$author.profile.fullName$": { [Op.like]: `%${trimmedKeyword}%` } },
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
  getAdminPostAnalyticsService,
  toggleAdminPostActiveService,
  deleteAdminPostService,
  getAdminCommentsService,
  deleteAdminCommentService: softDeleteAdminCommentService,
  getCommentReportsService,
  rejectCommentReportService,
  hideCommentService,
  unhideCommentService,
  warnCommentAuthorService,
  getPendingModerationPostsService,
  getPostModerationDetailService,
  approveModerationPostService,
  rejectModerationPostService,
};

export default adminPostService;
