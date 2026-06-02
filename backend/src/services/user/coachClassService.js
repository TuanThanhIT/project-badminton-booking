import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  ClassEnrollment,
  ClassRoom,
  Conversation,
  ConversationParticipant,
  Post,
  Profile,
  User,
} from "../../models/index.js";
import { POST_TYPE } from "../../constants/postConstant.js";
import {
  CLASS_ENROLLMENT_STATUS,
  CLASS_NOTIFICATION_TYPE,
  ENROLLMENT_SOURCE,
  ENROLLMENT_STATUS,
} from "../../constants/classConstant.js";
import { CONVERSATION_TYPE, ROLE_CONVERSATION } from "../../constants/messageConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { sendUserNotification } from "../../helpers/notification.js";
import messageService from "./messageService.js";

const ACTIVE_OR_PENDING = [
  ENROLLMENT_STATUS.PENDING,
  ENROLLMENT_STATUS.ACTIVE,
];

const studentInclude = {
  model: User,
  as: "student",
  attributes: ["id", "username"],
  include: [
    {
      model: Profile,
      as: "profile",
      attributes: ["fullName", "avatar", "phoneNumber", "level"],
    },
  ],
};

const postInclude = {
  model: Post,
  as: "post",
  attributes: ["id", "title", "type", "formData", "authorId"],
};

const assertClassPost = async (postId, transaction) => {
  const post = await Post.findOne({
    where: { id: postId, isDeleted: false, isActive: true, type: POST_TYPE.CLASS },
    transaction,
  });
  if (!post) throw new NotFoundError("Không tìm thấy bài đăng lớp học.");
  return post;
};

const getMaxStudents = (post) => {
  const max = Number(post?.formData?.maxStudents);
  return Number.isInteger(max) && max > 0 ? max : null;
};

const countActiveEnrollments = async (postId, transaction) =>
  ClassEnrollment.count({
    where: { postId, status: ENROLLMENT_STATUS.ACTIVE },
    transaction,
  });

const mapEnrollment = (row) => ({
  id: row.id,
  postId: row.postId,
  coachUserId: row.coachUserId,
  studentUserId: row.studentUserId,
  status: row.status,
  source: row.source,
  coachNote: row.coachNote,
  rejectReason: row.rejectReason,
  createdDate: row.createdDate,
  updatedDate: row.updatedDate,
  student: row.student
    ? {
        id: row.student.id,
        username: row.student.username,
        profile: row.student.profile,
      }
    : null,
  post: row.post
    ? {
        id: row.post.id,
        title: row.post.title,
        formData: row.post.formData,
      }
    : null,
});

const getClassEnrollmentStatus = (room) =>
  room?.enrollmentStatus || CLASS_ENROLLMENT_STATUS.OPEN;

const assertUserCanEnroll = async (postId, transaction) => {
  const room = await ClassRoom.findOne({ where: { postId }, transaction });
  const status = getClassEnrollmentStatus(room);
  if (status === CLASS_ENROLLMENT_STATUS.LOCKED) {
    throw new BadRequestError("Lớp học tạm khóa đăng ký.");
  }
  if (status === CLASS_ENROLLMENT_STATUS.ENDED) {
    throw new BadRequestError("Lớp học đã kết thúc, không nhận thêm học viên.");
  }
};

const assertCoachCanAddMember = async (postId, transaction) => {
  const room = await ClassRoom.findOne({ where: { postId }, transaction });
  const status = getClassEnrollmentStatus(room);
  if (status === CLASS_ENROLLMENT_STATUS.ENDED) {
    throw new BadRequestError("Lớp học đã kết thúc, không thể thêm học viên.");
  }
};

const ensureClassRoomRecord = async ({ post, transaction }) => {
  const [room] = await ClassRoom.findOrCreate({
    where: { postId: post.id },
    defaults: {
      postId: post.id,
      coachUserId: post.authorId,
      conversationId: null,
      enrollmentStatus: CLASS_ENROLLMENT_STATUS.OPEN,
    },
    transaction,
  });
  return room;
};

const addUserToClassConversation = async ({
  conversationId,
  userId,
  transaction,
}) => {
  const existing = await ConversationParticipant.findOne({
    where: { conversationId, userId },
    transaction,
  });
  if (existing) return;

  await ConversationParticipant.create(
    {
      conversationId,
      userId,
      role: ROLE_CONVERSATION.MEMBER,
    },
    { transaction },
  );
};

const createClassGroupConversation = async ({
  post,
  memberUserIds,
  transaction,
}) => {
  const uniqueIds = [...new Set(memberUserIds.map(Number))].filter(
    (id) => id !== post.authorId,
  );

  const conversation = await Conversation.create(
    {
      conversationName: `[Lớp] ${post.title}`.slice(0, 255),
      type: CONVERSATION_TYPE.GROUP,
    },
    { transaction },
  );

  const rows = [
    {
      conversationId: conversation.id,
      userId: post.authorId,
      role: ROLE_CONVERSATION.ADMIN,
    },
    ...uniqueIds.map((userId) => ({
      conversationId: conversation.id,
      userId,
      role: ROLE_CONVERSATION.MEMBER,
    })),
  ];

  await ConversationParticipant.bulkCreate(rows, { transaction });
  return conversation;
};

const syncStudentToClassChat = async ({ post, studentUserId, transaction }) => {
  const room = await ensureClassRoomRecord({ post, transaction });
  let conversationId = room.conversationId;

  if (!conversationId) {
    const conversation = await createClassGroupConversation({
      post,
      memberUserIds: [studentUserId],
      transaction,
    });
    conversationId = conversation.id;
    await room.update({ conversationId }, { transaction });
  } else {
    await addUserToClassConversation({
      conversationId,
      userId: studentUserId,
      transaction,
    });
    await Conversation.update(
      { updatedDate: new Date() },
      { where: { id: conversationId }, transaction },
    );
  }

  return conversationId;
};

const getCoachDashboardService = async ({ coachUserId }) => {
  const [pending, active, classCount] = await Promise.all([
    ClassEnrollment.count({
      where: { coachUserId, status: ENROLLMENT_STATUS.PENDING },
    }),
    ClassEnrollment.count({
      where: { coachUserId, status: ENROLLMENT_STATUS.ACTIVE },
    }),
    Post.count({
      where: {
        authorId: coachUserId,
        type: POST_TYPE.CLASS,
        isDeleted: false,
        isActive: true,
      },
    }),
  ]);

  return { pending, active, classCount };
};

const getCoachClassesService = async ({ coachUserId }) => {
  const posts = await Post.findAll({
    where: {
      authorId: coachUserId,
      type: POST_TYPE.CLASS,
      isDeleted: false,
      isActive: true,
    },
    order: [["createdDate", "DESC"]],
    include: [
      {
        model: ClassRoom,
        as: "classRoom",
        attributes: ["id", "conversationId", "enrollmentStatus"],
        required: false,
      },
    ],
  });

  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);

  const enrollmentRows = await ClassEnrollment.findAll({
    where: { postId: { [Op.in]: postIds } },
    attributes: ["postId", "status"],
    raw: true,
  });

  const statMap = {};
  for (const post of posts) {
    statMap[post.id] = { pending: 0, active: 0, rejected: 0, completed: 0 };
  }

  for (const row of enrollmentRows) {
    const postId = Number(row.postId);
    const status = String(row.status || "").toLowerCase();
    if (!statMap[postId]) continue;
    if (status === "pending") statMap[postId].pending += 1;
    else if (status === "active") statMap[postId].active += 1;
    else if (status === "rejected") statMap[postId].rejected += 1;
    else if (status === "completed") statMap[postId].completed += 1;
  }

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    formData: post.formData,
    createdDate: post.createdDate,
    conversationId: post.classRoom?.conversationId || null,
    enrollmentStatus: getClassEnrollmentStatus(post.classRoom),
    stats: statMap[post.id] || {
      pending: 0,
      active: 0,
      rejected: 0,
      completed: 0,
    },
    maxStudents: getMaxStudents(post),
  }));
};

const getCoachEnrollmentsService = async (data) => {
  const { coachUserId, postId, status, page = 1, limit = 20 } = data;
  const where = { coachUserId };
  if (postId) where.postId = postId;
  if (status) where.status = status;

  const offset = (Number(page) - 1) * Number(limit);
  const result = await ClassEnrollment.findAndCountAll({
    where,
    limit: Number(limit),
    offset,
    order: [["createdDate", "DESC"]],
    include: [studentInclude, postInclude],
  });

  return {
    total: result.count,
    page: Number(page),
    limit: Number(limit),
    data: result.rows.map(mapEnrollment),
  };
};

const getMyEnrollmentsService = async ({
  studentUserId,
  status,
  page = 1,
  limit = 20,
}) => {
  const where = { studentUserId };
  if (status) where.status = status;

  const offset = (Number(page) - 1) * Number(limit);
  const result = await ClassEnrollment.findAndCountAll({
    where,
    limit: Number(limit),
    offset,
    order: [["createdDate", "DESC"]],
    include: [postInclude],
  });

  return {
    total: result.count,
    page: Number(page),
    limit: Number(limit),
    data: result.rows.map(mapEnrollment),
  };
};

const getPostEnrollmentContextService = async ({ postId, userId }) => {
  const post = await assertClassPost(postId);

  const [activeCount, pendingCount, mine] = await Promise.all([
    countActiveEnrollments(postId),
    ClassEnrollment.count({
      where: { postId, status: ENROLLMENT_STATUS.PENDING },
    }),
    userId
      ? ClassEnrollment.findOne({
          where: { postId, studentUserId: userId },
        })
      : null,
  ]);

  const room = await ClassRoom.findOne({ where: { postId } });
  const enrollmentStatus = getClassEnrollmentStatus(room);

  return {
    postId: post.id,
    coachUserId: post.authorId,
    maxStudents: getMaxStudents(post),
    activeCount,
    pendingCount,
    conversationId: room?.conversationId || null,
    enrollmentStatus,
    canEnroll: enrollmentStatus === CLASS_ENROLLMENT_STATUS.OPEN,
    myEnrollment: mine ? mapEnrollment(mine) : null,
    isAuthor: userId ? Number(post.authorId) === Number(userId) : false,
  };
};

const enrollInClassService = async ({ postId, studentUserId }) => {
  return sequelize.transaction(async (t) => {
    const post = await assertClassPost(postId, t);

    if (Number(post.authorId) === Number(studentUserId)) {
      throw new BadRequestError("Bạn không thể đăng ký lớp học của chính mình.");
    }

    await assertUserCanEnroll(postId, t);

    const existing = await ClassEnrollment.findOne({
      where: {
        postId,
        studentUserId,
        status: { [Op.in]: ACTIVE_OR_PENDING },
      },
      transaction: t,
    });

    if (existing) {
      throw new BadRequestError("Bạn đã đăng ký hoặc đang chờ duyệt lớp này.");
    }

    const maxStudents = getMaxStudents(post);
    if (maxStudents) {
      const activeCount = await countActiveEnrollments(postId, t);
      if (activeCount >= maxStudents) {
        throw new BadRequestError("Lớp học đã đủ số học viên.");
      }
    }

    const enrollment = await ClassEnrollment.create(
      {
        postId,
        coachUserId: post.authorId,
        studentUserId,
        status: ENROLLMENT_STATUS.PENDING,
        source: ENROLLMENT_SOURCE.POST_REGISTER,
      },
      { transaction: t },
    );

    const student = await User.findByPk(studentUserId, {
      include: [{ model: Profile, as: "profile", attributes: ["fullName"] }],
      transaction: t,
    });

    await sendUserNotification(
      post.authorId,
      CLASS_NOTIFICATION_TYPE.ENROLLMENT_REQUEST,
      "Yêu cầu đăng ký lớp học",
      `${student?.profile?.fullName || student?.username || "Học viên"} muốn tham gia lớp "${post.title}".`,
      { transaction: t },
    );

    return mapEnrollment(enrollment);
  });
};

const updateEnrollmentService = async ({
  coachUserId,
  enrollmentId,
  status,
  coachNote,
  rejectReason,
}) => {
  return sequelize.transaction(async (t) => {
    const enrollment = await ClassEnrollment.findByPk(enrollmentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [postInclude, studentInclude],
    });

    if (!enrollment) throw new NotFoundError("Không tìm thấy đăng ký.");
    if (Number(enrollment.coachUserId) !== Number(coachUserId)) {
      throw new ForbiddenError("Bạn không có quyền quản lý đăng ký này.");
    }

    const post = enrollment.post || (await assertClassPost(enrollment.postId, t));

    if (status === ENROLLMENT_STATUS.ACTIVE) {
      const maxStudents = getMaxStudents(post);
      if (maxStudents) {
        const activeCount = await countActiveEnrollments(post.id, t);
        if (
          enrollment.status !== ENROLLMENT_STATUS.ACTIVE &&
          activeCount >= maxStudents
        ) {
          throw new BadRequestError("Lớp học đã đủ số học viên.");
        }
      }
    }

    if (status === ENROLLMENT_STATUS.REJECTED && !rejectReason?.trim()) {
      throw new BadRequestError("Vui lòng nhập lý do từ chối.");
    }

    const payload = { status };
    if (coachNote !== undefined) payload.coachNote = coachNote?.trim() || null;
    if (rejectReason !== undefined) {
      payload.rejectReason = rejectReason?.trim() || null;
    }

    await enrollment.update(payload, { transaction: t });

    if (status === ENROLLMENT_STATUS.ACTIVE) {
      const conversationId = await syncStudentToClassChat({
        post,
        studentUserId: enrollment.studentUserId,
        transaction: t,
      });

      await sendUserNotification(
        enrollment.studentUserId,
        CLASS_NOTIFICATION_TYPE.ENROLLMENT_APPROVED,
        "Đăng ký lớp học được duyệt",
        `Bạn đã được chấp nhận vào lớp "${post.title}". Hãy vào nhóm chat lớp để nhận thông báo.`,
        { transaction: t },
      );

      enrollment.conversationId = conversationId;
    }

    if (status === ENROLLMENT_STATUS.REJECTED) {
      await sendUserNotification(
        enrollment.studentUserId,
        CLASS_NOTIFICATION_TYPE.ENROLLMENT_REJECTED,
        "Đăng ký lớp học bị từ chối",
        `Lớp "${post.title}": ${rejectReason?.trim() || "Không đủ điều kiện tham gia."}`,
        { transaction: t },
      );
    }

    return mapEnrollment(enrollment);
  });
};

const addMemberManuallyService = async ({
  coachUserId,
  postId,
  studentUserId,
}) => {
  return sequelize.transaction(async (t) => {
    const post = await assertClassPost(postId, t);
    if (Number(post.authorId) !== Number(coachUserId)) {
      throw new ForbiddenError("Bạn không phải người dạy của lớp này.");
    }
    if (Number(studentUserId) === Number(coachUserId)) {
      throw new BadRequestError("Không thể thêm chính bạn vào lớp.");
    }

    await assertCoachCanAddMember(postId, t);

    const student = await User.findOne({
      where: { id: studentUserId, isActive: true },
      transaction: t,
    });
    if (!student) throw new NotFoundError("Không tìm thấy học viên.");

    const existing = await ClassEnrollment.findOne({
      where: { postId, studentUserId },
      transaction: t,
    });

    const maxStudents = getMaxStudents(post);
    if (maxStudents) {
      const activeCount = await countActiveEnrollments(postId, t);
      if (
        (!existing || existing.status !== ENROLLMENT_STATUS.ACTIVE) &&
        activeCount >= maxStudents
      ) {
        throw new BadRequestError("Lớp học đã đủ số học viên.");
      }
    }

    let enrollment = existing;
    if (existing) {
      if (existing.status === ENROLLMENT_STATUS.ACTIVE) {
        throw new BadRequestError("Học viên đã có trong lớp.");
      }
      await existing.update(
        {
          status: ENROLLMENT_STATUS.ACTIVE,
          source: ENROLLMENT_SOURCE.COACH_MANUAL,
          rejectReason: null,
        },
        { transaction: t },
      );
    } else {
      enrollment = await ClassEnrollment.create(
        {
          postId,
          coachUserId,
          studentUserId,
          status: ENROLLMENT_STATUS.ACTIVE,
          source: ENROLLMENT_SOURCE.COACH_MANUAL,
        },
        { transaction: t },
      );
    }

    const conversationId = await syncStudentToClassChat({
      post,
      studentUserId,
      transaction: t,
    });

    await sendUserNotification(
      studentUserId,
      CLASS_NOTIFICATION_TYPE.ENROLLMENT_APPROVED,
      "Bạn được thêm vào lớp học",
      `Người dạy đã thêm bạn vào lớp "${post.title}".`,
      { transaction: t },
    );

    const full = await ClassEnrollment.findByPk(enrollment.id, {
      include: [studentInclude, postInclude],
      transaction: t,
    });

    return { ...mapEnrollment(full), conversationId };
  });
};

const cancelEnrollmentService = async ({ enrollmentId, studentUserId }) => {
  return sequelize.transaction(async (t) => {
    const enrollment = await ClassEnrollment.findByPk(enrollmentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!enrollment) throw new NotFoundError("Không tìm thấy đăng ký.");
    if (Number(enrollment.studentUserId) !== Number(studentUserId)) {
      throw new ForbiddenError("Bạn không thể hủy đăng ký này.");
    }
    if (![ENROLLMENT_STATUS.PENDING, ENROLLMENT_STATUS.ACTIVE].includes(enrollment.status)) {
      throw new BadRequestError("Không thể hủy đăng ký ở trạng thái hiện tại.");
    }

    await enrollment.update({ status: ENROLLMENT_STATUS.CANCELLED }, { transaction: t });
    return mapEnrollment(enrollment);
  });
};

const getOrCreateClassConversationService = async ({ coachUserId, postId }) => {
  return sequelize.transaction(async (t) => {
    const post = await assertClassPost(postId, t);
    if (Number(post.authorId) !== Number(coachUserId)) {
      throw new ForbiddenError("Bạn không phải người dạy của lớp này.");
    }

    const room = await ensureClassRoomRecord({ post, transaction: t });
    if (room.conversationId) {
      return { conversationId: room.conversationId };
    }

    const activeStudents = await ClassEnrollment.findAll({
      where: { postId, status: ENROLLMENT_STATUS.ACTIVE },
      attributes: ["studentUserId"],
      transaction: t,
    });

    const conversation = await createClassGroupConversation({
      post,
      memberUserIds: activeStudents.map((e) => e.studentUserId),
      transaction: t,
    });

    await room.update({ conversationId: conversation.id }, { transaction: t });
    return { conversationId: conversation.id };
  });
};

const notifyClassMembersService = async ({
  coachUserId,
  postId,
  title,
  message,
  alsoSendChat,
}) => {
  return sequelize.transaction(async (t) => {
    const post = await assertClassPost(postId, t);
    if (Number(post.authorId) !== Number(coachUserId)) {
      throw new ForbiddenError("Bạn không phải người dạy của lớp này.");
    }

    const activeEnrollments = await ClassEnrollment.findAll({
      where: { postId, status: ENROLLMENT_STATUS.ACTIVE },
      transaction: t,
    });

    const notifyTitle = title?.trim() || `Thông báo lớp "${post.title}"`;
    const notifyMessage = message?.trim();
    if (!notifyMessage) {
      throw new BadRequestError("Nội dung thông báo không được để trống.");
    }

    await Promise.all(
      activeEnrollments.map((enrollment) =>
        sendUserNotification(
          enrollment.studentUserId,
          CLASS_NOTIFICATION_TYPE.CLASS_BROADCAST,
          notifyTitle,
          notifyMessage,
          { transaction: t },
        ),
      ),
    );

    let conversationId = null;
    if (alsoSendChat) {
      const room = await ensureClassRoomRecord({ post, transaction: t });
      if (!room.conversationId && activeEnrollments.length > 0) {
        const conversation = await createClassGroupConversation({
          post,
          memberUserIds: activeEnrollments.map((e) => e.studentUserId),
          transaction: t,
        });
        await room.update({ conversationId: conversation.id }, { transaction: t });
        conversationId = conversation.id;
      } else {
        conversationId = room.conversationId;
      }

      if (conversationId) {
        t.afterCommit(async () => {
          try {
            await messageService.sendMessageService({
              userId: coachUserId,
              conversationId,
              body: `[Thông báo lớp] ${notifyMessage}`,
            });
          } catch (err) {
            console.error("Gửi tin nhắn nhóm lớp thất bại:", err.message);
          }
        });
      }
    }

    return {
      notifiedCount: activeEnrollments.length,
      conversationId,
    };
  });
};

const updateClassStatusService = async ({ coachUserId, postId, action }) => {
  return sequelize.transaction(async (t) => {
    const post = await assertClassPost(postId, t);
    if (Number(post.authorId) !== Number(coachUserId)) {
      throw new ForbiddenError("Bạn không phải người dạy của lớp này.");
    }

    const room = await ensureClassRoomRecord({ post, transaction: t });
    const current = getClassEnrollmentStatus(room);

    let nextStatus;
    if (action === "lock") {
      if (current === CLASS_ENROLLMENT_STATUS.ENDED) {
        throw new BadRequestError("Lớp đã kết thúc, không thể khóa đăng ký.");
      }
      nextStatus = CLASS_ENROLLMENT_STATUS.LOCKED;
    } else if (action === "unlock") {
      if (current === CLASS_ENROLLMENT_STATUS.ENDED) {
        throw new BadRequestError("Lớp đã kết thúc, không thể mở lại đăng ký.");
      }
      nextStatus = CLASS_ENROLLMENT_STATUS.OPEN;
    } else if (action === "end") {
      nextStatus = CLASS_ENROLLMENT_STATUS.ENDED;
    } else {
      throw new BadRequestError("Hành động không hợp lệ.");
    }

    await room.update({ enrollmentStatus: nextStatus }, { transaction: t });

    return {
      postId: post.id,
      enrollmentStatus: nextStatus,
    };
  });
};

const coachClassService = {
  getCoachDashboardService,
  getCoachClassesService,
  getCoachEnrollmentsService,
  getMyEnrollmentsService,
  getPostEnrollmentContextService,
  enrollInClassService,
  updateEnrollmentService,
  addMemberManuallyService,
  cancelEnrollmentService,
  getOrCreateClassConversationService,
  notifyClassMembersService,
  updateClassStatusService,
};

export default coachClassService;
