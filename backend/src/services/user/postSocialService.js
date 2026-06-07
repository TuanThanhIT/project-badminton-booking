import sequelize from "../../config/db.js";
import {
  Comment,
  Post,
  PostLike,
  PostShare,
  Profile,
  User,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import {
  COMMENT_TYPE,
  POST_REACTION,
} from "../../constants/postConstant.js";
import { sendUserNotification } from "../../helpers/notification.js";

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
      throw new BadRequestError("Invalid repost chain.");
    }
    visited.add(current.id);

    const parentId = Number(current.repostOfPostId || 0);
    if (!parentId) return current;

    current = await Post.findOne({
      where: { id: parentId, isDeleted: false },
      transaction,
    });
  }

  throw new BadRequestError("Repost chain is too deep.");
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
      Comment.count({ where: { postId, isDeleted: false }, transaction }),
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
  if (!currentUserId) throw new BadRequestError("Missing user information.");

  const reactionType = Object.values(POST_REACTION).includes(data.reactionType)
    ? data.reactionType
    : POST_REACTION.LIKE;

  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
    });
    if (!post) throw new NotFoundError("Post not found.");

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
  if (!userId) throw new BadRequestError("Missing user information.");

  const text = (content ?? "").toString().trim();
  if (!text) throw new BadRequestError("Comment content is required.");
  if (text.length > 2000) throw new BadRequestError("Comment content is too long.");

  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
    });
    if (!post) throw new NotFoundError("Post not found.");

    let parentIdNum =
      parentId === undefined || parentId === null ? null : Number(parentId);
    if (parentIdNum !== null) {
      if (Number.isNaN(parentIdNum) || parentIdNum <= 0) {
        throw new BadRequestError("Invalid parentId.");
      }

      const parent = await Comment.findOne({
        where: { id: parentIdNum, postId, isDeleted: false },
        attributes: ["id", "parentId"],
        transaction: t,
      });
      if (!parent) throw new NotFoundError("Parent comment not found.");
      parentIdNum = parent.parentId || parent.id;
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
      title: parentIdNum ? "Bài viết có phản hồi mới" : "Bài viết có bình luận mới",
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
      where: { postId, parentId: null, isDeleted: false },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      transaction: t,
      include: [authorInclude],
    });

    const rootIds = roots.map((comment) => comment.id);
    const replies = rootIds.length
      ? await Comment.findAll({
          where: { postId, parentId: rootIds, isDeleted: false },
          order: [["createdAt", "ASC"]],
          transaction: t,
          include: [authorInclude],
        })
      : [];

    return {
      comments: [...roots, ...replies],
      total: count,
      page,
      limit,
      hasMore: offset + roots.length < count,
    };
  });
};

const createRepostService = async (data) => {
  const { postId, content, User: authUser } = data;
  const currentUserId = authUser?.id;
  if (!currentUserId) throw new BadRequestError("Missing user information.");

  const repostText =
    content === undefined || content === null ? null : content.toString().trim();
  if (repostText && repostText.length > 2000) {
    throw new BadRequestError("Share content is too long.");
  }

  return sequelize.transaction(async (t) => {
    const selectedPost = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction: t,
    });
    if (!selectedPost) throw new NotFoundError("Post not found.");

    const rootPost = await resolveOriginalPost(selectedPost, t);
    if (!rootPost) throw new NotFoundError("Original post not found.");

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
  createRepostService,
};

export default postSocialService;
