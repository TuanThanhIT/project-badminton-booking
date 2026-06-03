import { Op, literal } from "sequelize";
import { Post, Comment, User, Profile } from "../../models/index.js";
import { POST_TYPE } from "../../constants/postConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";

const getAdminPostsService = async (data) => {
  const { page = 1, limit = 10, search, type, isActive, isDeleted } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }
  if (type) where.type = type;
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

const adminPostService = {
  getAdminPostsService,
  toggleAdminPostActiveService,
  deleteAdminPostService,
  getAdminCommentsService,
  deleteAdminCommentService,
};

export default adminPostService;
