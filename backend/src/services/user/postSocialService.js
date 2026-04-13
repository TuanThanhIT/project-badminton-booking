import sequelize from "../../config/db.js";
import { Post, User, Profile, Comment, PostLike, PostShare } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { COMMENT_TYPE, SHARE_TYPE } from "../../constants/postConstant.js";

// Tính toán lại số lượng like/comment/share cho bài đăng, đồng thời check xem current user đã like/share chưa (để UI hiện trạng thái chính xác).
const buildPostCounts = async (postId, currentUserId, transaction) => {
  // sharesCount tính theo bài gốc nếu bài hiện tại là repost
  const post = await Post.findOne({
    where: { id: postId },
    attributes: ["id", "repostOfPostId"],
    transaction,
  });

  const repostOfPostId = post?.repostOfPostId ?? null;
  const targetSharePostId = repostOfPostId && repostOfPostId > 0 ? repostOfPostId : postId;

  const [likesCount, commentsCount, sharesCount, sharedByMe] = await Promise.all([
    PostLike.count({ where: { postId }, transaction }),
    Comment.count({ where: { postId }, transaction }),
    PostShare.count({ where: { postId: targetSharePostId }, transaction }),
    currentUserId
      ? PostShare.count({ where: { postId: targetSharePostId, userId: currentUserId }, transaction }).then(
          (n) => n > 0,
        )
      : Promise.resolve(false),
  ]);

  const likedByMe = currentUserId
    ? await PostLike.count({ where: { postId, userId: currentUserId }, transaction }).then(
        (n) => n > 0,
      )
    : false;

  return { likesCount, commentsCount, sharesCount, likedByMe, sharedByMe };
};

const toggleLikeService = async (data) => {
  const { postId, User } = data;
  const currentUserId = User?.id;
  if (!currentUserId) throw new BadRequestError("Thiếu thông tin người dùng.");

  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({ where: { id: postId, isDeleted: false }, transaction: t });
    if (!post) throw new NotFoundError("Không tìm thấy bài đăng.");

    const existing = await PostLike.findOne({
      where: { userId: currentUserId, postId },
      transaction: t,
    });

    if (existing) {
      await existing.destroy({ transaction: t });
    } else {
      await PostLike.create({ userId: currentUserId, postId }, { transaction: t });
    }

    return buildPostCounts(postId, currentUserId, t);
  });
};

const createCommentService = async (data) => {
  const { postId, content, User, parentId } = data;
  const currentUserId = User?.id;
  if (!currentUserId) throw new BadRequestError("Thiếu thông tin người dùng.");

  const text = (content ?? "").toString().trim();
  if (!text) throw new BadRequestError("Nội dung bình luận không được để trống.");
  if (text.length > 2000) throw new BadRequestError("Nội dung bình luận quá dài.");

  return sequelize.transaction(async (t) => {
    const post = await Post.findOne({ where: { id: postId, isDeleted: false }, transaction: t });
    if (!post) throw new NotFoundError("Không tìm thấy bài đăng.");

    const parentIdNum = parentId === undefined || parentId === null ? null : Number(parentId);
    if (parentIdNum !== null) {
      if (Number.isNaN(parentIdNum) || parentIdNum <= 0) {
        throw new BadRequestError("parentId không hợp lệ.");
      }
      const anyParent = await Comment.findOne({
        where: { id: parentIdNum, postId },
        transaction: t,
      });
      if (!anyParent) throw new NotFoundError("Không tìm thấy comment để trả lời.");
    }

    const type = parentIdNum ? COMMENT_TYPE.REPLY : COMMENT_TYPE.COMMENT;
    const created = await Comment.create(
      { authorId: currentUserId, postId, content: text, type, parentId: parentIdNum },
      { transaction: t },
    );

    const result = await Comment.findOne({
      where: { id: created.id },
      transaction: t,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "email"],
          include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
        },
      ],
    });

    const counts = await buildPostCounts(postId, currentUserId, t);
    return { comment: result, ...counts };
  });
};

const getCommentsService = async (data) => {
  const { postId } = data;
  return sequelize.transaction(async (t) => {
    const comments = await Comment.findAll({
      where: { postId },
      order: [["createdDate", "DESC"]],
      transaction: t,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "email"],
          include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
        },
      ],
    });

    return { comments };
  });
};

const createRepostService = async (data) => {
  const { postId, content, User } = data;
  const currentUserId = User?.id;
  if (!currentUserId) throw new BadRequestError("Thiếu thông tin người dùng.");

  const repostText = content === undefined || content === null ? null : content.toString().trim();
  if (repostText && repostText.length > 2000) throw new BadRequestError("Nội dung chia sẻ quá dài.");

  return sequelize.transaction(async (t) => {
    const original = await Post.findOne({ where: { id: postId, isDeleted: false }, transaction: t });
    if (!original) throw new NotFoundError("Không tìm thấy bài đăng.");

    // Nếu post đang là repost thì luôn share cho bài gốc (1 tầng như Facebook)
    const repostOfPostId = original?.repostOfPostId ?? null;
    const rootPostId = repostOfPostId && repostOfPostId > 0 ? repostOfPostId : postId;
    const rootPost =
      rootPostId === postId
        ? original
        : await Post.findOne({ where: { id: rootPostId, isDeleted: false }, transaction: t });

    const safeRootPost = rootPost || original;

    const existingShare = await PostShare.findOne({
      where: { userId: currentUserId, postId: safeRootPost.id },
      transaction: t,
    });
    if (existingShare) {
      throw new BadRequestError("Bài viết đã chia sẻ.");
    }

    const repostPost = await Post.create(
      {
        authorId: currentUserId,
        type: safeRootPost.type,
        // Repost wrapper: giữ title của bài gốc để filter/type hoạt động tự nhiên.
        // Caption của người share nằm ở content (giống Facebook).
        title: safeRootPost.title,
        content: repostText || null,
        repostOfPostId: safeRootPost.id,
        isRepost: true,
        formData: null,
        isActive: true,
        isDeleted: false,
      },
      { transaction: t },
    );

    await PostShare.create(
      {
        userId: currentUserId,
        postId: safeRootPost.id,
        content: repostText,
        type: SHARE_TYPE.REPOST,
      },
      { transaction: t },
    );

    const counts = await buildPostCounts(postId, currentUserId, t);
    return { repostPost, ...counts };
  });
};

const postSocialService = {
  toggleLikeService,
  createCommentService,
  getCommentsService,
  createRepostService,
};

export default postSocialService;

