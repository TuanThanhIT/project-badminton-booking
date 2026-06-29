import sequelize from "../../config/db.js";
import { Op } from "sequelize";
import {
  Comment,
  CommentReport,
  Post,
  PostLike,
  PostShare,
  Profile,
  User,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import { COMMENT_TYPE, POST_REACTION } from "../../constants/postConstant.js";
import {
  COMMENT_REPORT_AUTO_HIDE_THRESHOLD,
  COMMENT_REPORT_REASON_LABEL,
  COMMENT_REPORT_STATUS,
} from "../../constants/commentReportConstant.js";
import {
  sendAdminNotification,
  sendUserNotification,
} from "../../helpers/notification.js";

const rootPostIdOf = (post, fallbackId) => {
  const repostOfPostId = Number(post?.repostOfPostId || 0);
  return repostOfPostId > 0 ? repostOfPostId : Number(fallbackId);
};

const resolveOriginalPost = async (post, transaction) => {
  let current = post;
  const visited = new Set();

  for (let depth = 0; depth < 20; depth += 1) {
    if (!current) return null;
    if (visited.has(current.id)) {
      throw new BadRequestError("Chuỗi đăng lại không hợp lệ.");
    }
    visited.add(current.id);

    const parentId = Number(current.repostOfPostId || 0);
    if (!parentId) return current;

    current = await Post.findOne({
      where: { id: parentId, isDeleted: false },
      transaction,
    });
  }

  throw new BadRequestError("Chuỗi đăng lại quá sâu.");
};

const emptyReactionSummary = () =>
  Object.values(POST_REACTION).reduce((summary, reactionType) => {
    summary[reactionType] = 0;
    return summary;
  }, {});

const buildReactionSummary = async (postId, transaction) => {
  const rows = await PostLike.findAll({
    attributes: [
      "reactionType",
      [sequelize.fn("COUNT", sequelize.col("reactionType")), "count"],
    ],
    where: { postId },
    group: ["reactionType"],
    raw: true,
    transaction,
  });

  const summary = emptyReactionSummary();
  rows.forEach((row) => {
    if (Object.values(POST_REACTION).includes(row.reactionType)) {
      summary[row.reactionType] = Number(row.count || 0);
    }
  });
  return summary;
};

const authorInclude = {
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
};

const getActorName = async (userId, transaction) => {
  const actor = await User.findOne({
    where: { id: userId },
    attributes: ["id", "username"],
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName"],
      },
    ],
    transaction,
  });

  return actor?.profile?.fullName || actor?.username || "Một người dùng";
};

const notifyPostOwner = async ({
  post,
  actorId,
  type,
  title,
  message,
  transaction,
}) => {
  if (!post?.authorId || Number(post.authorId) === Number(actorId)) return;

  await sendUserNotification(post.authorId, type, title, message, {
    transaction,
  });
};

const buildPostCounts = async (postId, currentUserId, transaction) => {
  const post = await Post.findOne({
    where: { id: postId },
    attributes: ["id", "repostOfPostId"],
    transaction,
  });

  const rootPostId = rootPostIdOf(post, postId);

  const [
    likesCount,
    commentsCount,
    repostCount,
    legacyShareCount,
    sharedByMe,
    reactionSummary,
  ] = await Promise.all([
    PostLike.count({ where: { postId }, transaction }),
    Comment.count({
      where: { postId, isDeleted: false, isActive: true },
      transaction,
    }),
    Post.count({
      where: { repostOfPostId: rootPostId, isDeleted: false },
      transaction,
    }),
    PostShare.count({ where: { postId: rootPostId }, transaction }),
    currentUserId
      ? Promise.all([
          PostShare.count({
            where: { postId: rootPostId, userId: currentUserId },
            transaction,
          }),
          Post.count({
            where: {
              repostOfPostId: rootPostId,
              authorId: currentUserId,
              isDeleted: false,
            },
            transaction,
          }),
        ]).then(([shareRows, repostRows]) => shareRows > 0 || repostRows > 0)
      : Promise.resolve(false),
    buildReactionSummary(postId, transaction),
  ]);

  const myReaction = currentUserId
    ? await PostLike.findOne({
        where: { postId, userId: currentUserId },
        attributes: ["reactionType"],
        transaction,
      })
    : null;

  return {
    likesCount,
    commentsCount,
    sharesCount: Math.max(repostCount, legacyShareCount),
    likedByMe: Boolean(myReaction),
    sharedByMe,
    reactionByMe: myReaction?.reactionType || null,
    reactionSummary,
  };
};

const toggleLikeService = async (data) => {
  const { postId, User: authUser } = data;
  const currentUserId = authUser?.id;
  if (!currentUserId) throw new BadRequestError("Thiếu thông tin người dùng.");

  const reactionType = Object.values(POST_REACTION).includes(data.reactionType)
    ? data.reactionType
    : POST_REACTION.LIKE;

  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
    });
    if (!post) throw new NotFoundError("Không tìm thấy bài viết.");

    const existing = await PostLike.findOne({
      where: { userId: currentUserId, postId },
      transaction: t,
    });

    let shouldNotifyLike = false;

    if (existing && existing.reactionType === reactionType) {
      await existing.destroy({ transaction: t });
    } else if (existing) {
      await existing.update({ reactionType }, { transaction: t });
    } else {
      await PostLike.create(
        { userId: currentUserId, postId, reactionType },
        { transaction: t },
      );
      shouldNotifyLike = true;
    }

    if (shouldNotifyLike) {
      const actorName = await getActorName(currentUserId, t);
      await notifyPostOwner({
        post,
        actorId: currentUserId,
        type: "POST_LIKE",
        title: "Bài viết có cảm xúc mới",
        message: `${actorName} đã bày tỏ cảm xúc về bài viết "${post.title}".`,
        transaction: t,
      });
    }

    return buildPostCounts(postId, currentUserId, t);
  });
};

const createCommentService = async (data) => {
  const { postId, content, userId, parentId } = data;
  if (!userId) throw new BadRequestError("Thiếu thông tin người dùng.");

  const text = (content ?? "").toString().trim();
  if (!text) throw new BadRequestError("Nội dung bình luận là bắt buộc.");
  if (text.length > 2000)
    throw new BadRequestError("Nội dung bình luận quá dài.");

  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
    });
    if (!post) throw new NotFoundError("Không tìm thấy bài viết.");

    let parentIdNum =
      parentId === undefined || parentId === null ? null : Number(parentId);
    if (parentIdNum !== null) {
      if (Number.isNaN(parentIdNum) || parentIdNum <= 0) {
        throw new BadRequestError("Bình luận cha không hợp lệ.");
      }

      const parent = await Comment.findOne({
        where: { id: parentIdNum, postId, isDeleted: false, isActive: true },
        attributes: ["id", "parentId"],
        transaction: t,
      });
      if (!parent) throw new NotFoundError("Không tìm thấy bình luận cha.");
    }

    const type = parentIdNum ? COMMENT_TYPE.REPLY : COMMENT_TYPE.COMMENT;
    const created = await Comment.create(
      { authorId: userId, postId, content: text, type, parentId: parentIdNum },
      { transaction: t },
    );

    const comment = await Comment.findOne({
      where: { id: created.id },
      transaction: t,
      include: [authorInclude],
    });

    const counts = await buildPostCounts(postId, userId, t);
    const actorName = await getActorName(userId, t);
    await notifyPostOwner({
      post,
      actorId: userId,
      type: "POST_COMMENT",
      title: parentIdNum
        ? "Bài viết có phản hồi mới"
        : "Bài viết có bình luận mới",
      message: `${actorName} đã ${parentIdNum ? "trả lời bình luận trong" : "bình luận về"} bài viết "${post.title}".`,
      transaction: t,
    });

    return { comment, ...counts };
  });
};

const getCommentsService = async (data) => {
  const { postId } = data;
  const page = Math.max(1, Number(data.page || 1));
  const limit = Math.min(50, Math.max(1, Number(data.limit || 10)));
  const offset = (page - 1) * limit;

  return sequelize.transaction(async (t) => {
    const { count, rows: roots } = await Comment.findAndCountAll({
      where: { postId, parentId: null, isDeleted: false, isActive: true },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      transaction: t,
      include: [authorInclude],
    });

    const replies = [];
    let parentIds = roots.map((comment) => comment.id);

    while (parentIds.length > 0) {
      const children = await Comment.findAll({
        where: {
          postId,
          parentId: { [Op.in]: parentIds },
          isDeleted: false,
          isActive: true,
        },
        order: [["createdAt", "ASC"]],
        transaction: t,
        include: [authorInclude],
      });

      if (children.length === 0) break;
      replies.push(...children);
      parentIds = children.map((comment) => comment.id);
    }

    return {
      comments: [...roots, ...replies],
      total: count,
      page,
      limit,
      hasMore: offset + roots.length < count,
    };
  });
};

const deleteCommentService = async (data) => {
  const { commentId, userId } = data;
  if (!userId) throw new BadRequestError("Thiếu thông tin người dùng.");

  return sequelize.transaction(async (t) => {
    const comment = await Comment.findOne({
      where: { id: commentId, isDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [
        {
          model: Post,
          as: "post",
          attributes: ["id", "isDeleted"],
        },
      ],
    });

    if (!comment || comment.post?.isDeleted) {
      throw new NotFoundError("KhÃ´ng tÃ¬m tháº¥y bÃ¬nh luáº­n Ä‘á»ƒ gá»¡.");
    }

    if (Number(comment.authorId) !== Number(userId)) {
      throw new ForbiddenError("Báº¡n khÃ´ng cÃ³ quyá»n gá»¡ bÃ¬nh luáº­n nÃ y.");
    }

    const deletedAt = new Date();
    const deleteWhere = comment.parentId
      ? { id: comment.id }
      : { [Op.or]: [{ id: comment.id }, { parentId: comment.id }] };

    await Comment.update(
      { isDeleted: true, deletedAt },
      { where: deleteWhere, transaction: t },
    );

    return buildPostCounts(comment.postId, userId, t);
  });
};

const reportCommentService = async (data) => {
  const { commentId, userId, reason } = data;
  if (!userId) throw new BadRequestError("Thiếu thông tin người dùng.");

  const normalizedDescription =
    data.description === undefined || data.description === null
      ? null
      : data.description.toString().trim() || null;

  return sequelize.transaction(async (t) => {
    const comment = await Comment.findOne({
      where: { id: commentId, isDeleted: false, isActive: true },
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [
        {
          model: Post,
          as: "post",
          attributes: ["id", "title", "isDeleted"],
        },
      ],
    });

    if (!comment || comment.post?.isDeleted) {
      throw new NotFoundError("Không tìm thấy bình luận để báo cáo.");
    }

    if (Number(comment.authorId) === Number(userId)) {
      throw new BadRequestError(
        "Bạn không thể báo cáo bình luận của chính mình.",
      );
    }

    const existingReport = await CommentReport.findOne({
      where: { commentId, reporterId: userId },
      transaction: t,
    });
    if (existingReport) {
      throw new BadRequestError("Bạn đã báo cáo bình luận này trước đó.");
    }

    const report = await CommentReport.create(
      {
        commentId,
        reporterId: userId,
        reason,
        description: normalizedDescription,
        status: COMMENT_REPORT_STATUS.PENDING,
      },
      { transaction: t },
    );

    const reportCount = await CommentReport.count({
      where: { commentId },
      distinct: true,
      col: "reporterId",
      transaction: t,
    });

    const shouldAutoHide =
      reportCount >= COMMENT_REPORT_AUTO_HIDE_THRESHOLD && comment.isActive;
    const hiddenReason = shouldAutoHide
      ? `Tự động ẩn do có ${reportCount} người báo cáo bình luận.`
      : comment.hiddenReason;

    await comment.update(
      {
        reportCount,
        ...(shouldAutoHide
          ? {
              isActive: false,
              autoHiddenByReports: true,
              hiddenReason,
              hiddenAt: new Date(),
            }
          : {}),
      },
      { transaction: t },
    );

    await sendAdminNotification(
      "COMMENT_REPORTED",
      shouldAutoHide ? "Bình luận đã tự động ẩn" : "Bình luận mới bị báo cáo",
      `Bình luận #${comment.id} trong bài "${comment.post?.title || `#${comment.postId}`}" bị báo cáo: ${COMMENT_REPORT_REASON_LABEL[reason] || reason}.`,
      { transaction: t },
    );

    if (shouldAutoHide) {
      await CommentReport.update(
        {
          status: COMMENT_REPORT_STATUS.RESOLVED,
          adminNote: hiddenReason,
          handledAt: new Date(),
        },
        {
          where: { commentId, status: COMMENT_REPORT_STATUS.PENDING },
          transaction: t,
        },
      );

      await sendUserNotification(
        comment.authorId,
        "COMMENT_AUTO_HIDDEN",
        "Bình luận đã bị ẩn",
        "Bình luận của bạn đã tạm thời bị ẩn do có nhiều báo cáo từ cộng đồng.",
        { transaction: t },
      );
    }

    return {
      report,
      reportCount,
      autoHidden: shouldAutoHide,
    };
  });
};

const createRepostService = async (data) => {
  const { postId, content, User: authUser } = data;
  const currentUserId = authUser?.id;
  if (!currentUserId) throw new BadRequestError("Thiếu thông tin người dùng.");

  const repostText =
    content === undefined || content === null
      ? null
      : content.toString().trim();
  if (repostText && repostText.length > 2000) {
    throw new BadRequestError("Nội dung chia sẻ quá dài.");
  }

  return sequelize.transaction(async (t) => {
    const selectedPost = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
    });
    if (!selectedPost) throw new NotFoundError("Không tìm thấy bài viết.");

    const rootPost = await resolveOriginalPost(selectedPost, t);
    if (!rootPost) throw new NotFoundError("Không tìm thấy bài viết gốc.");

    const createdRepost = await Post.create(
      {
        authorId: currentUserId,
        type: rootPost.type,
        title: rootPost.title,
        content: repostText || null,
        repostOfPostId: rootPost.id,
        isRepost: true,
        formData: null,
        isActive: true,
        isDeleted: false,
      },
      { transaction: t },
    );

    const repostPost = await Post.findOne({
      where: { id: createdRepost.id },
      transaction: t,
      include: [authorInclude],
    });

    const counts = await buildPostCounts(rootPost.id, currentUserId, t);
    const actorName = await getActorName(currentUserId, t);
    await notifyPostOwner({
      post: rootPost,
      actorId: currentUserId,
      type: "POST_SHARE",
      title: "Bài viết được chia sẻ",
      message: `${actorName} đã chia sẻ bài viết "${rootPost.title}".`,
      transaction: t,
    });

    return { repostPost, ...counts, targetPostId: rootPost.id };
  });
};

const postSocialService = {
  toggleLikeService,
  createCommentService,
  getCommentsService,
  deleteCommentService,
  reportCommentService,
  createRepostService,
};

export default postSocialService;
