import sequelize from "../../config/db.js";
import {
  User,
  Profile,
  Role,
  BranchManager,
  Branch,
  CoachProfile,
} from "../../models/index.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import { Op, QueryTypes } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";

const getAllManagersService = async (data = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    isActive,
    branchId,
  } = data;
  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const offset = (parsedPage - 1) * parsedLimit;

  const managerRole = await Role.findOne({ where: { roleName: ROLE_NAME.MANAGER } });
  if (!managerRole) {
    return {
      managers: [],
      pagination: { page: parsedPage, limit: parsedLimit, total: 0 },
      stats: { total: 0, active: 0, locked: 0, unassigned: 0 },
    };
  }

  const where = { roleId: managerRole.id };
  const trimmedSearch = String(search || "").trim();
  if (trimmedSearch) {
    where[Op.or] = [
      { username: { [Op.like]: `%${trimmedSearch}%` } },
      { email: { [Op.like]: `%${trimmedSearch}%` } },
      { "$profile.fullName$": { [Op.like]: `%${trimmedSearch}%` } },
    ];
  }

  const activeFilter = isActive !== undefined && isActive !== ""
    ? isActive
    : status === "active"
      ? true
      : status === "inactive"
        ? false
        : undefined;
  if (activeFilter !== undefined) {
    where.isActive = activeFilter === true || activeFilter === "true";
  }

  if (branchId !== undefined && branchId !== "") {
    const parsedBranchId = Number(branchId);
    if (parsedBranchId === -1) {
      const assignedRows = await sequelize.query(
        "SELECT DISTINCT managerId FROM BranchManagers",
        { type: QueryTypes.SELECT },
      );
      const assignedIds = assignedRows.map((row) => row.managerId);
      where.id = assignedIds.length ? { [Op.notIn]: assignedIds } : { [Op.ne]: null };
    } else if (parsedBranchId > 0) {
      const assignedRows = await sequelize.query(
        "SELECT DISTINCT managerId FROM BranchManagers WHERE branchId = :branchId",
        {
          replacements: { branchId: parsedBranchId },
          type: QueryTypes.SELECT,
        },
      );
      const assignedIds = assignedRows.map((row) => row.managerId);
      where.id = assignedIds.length ? { [Op.in]: assignedIds } : { [Op.in]: [0] };
    }
  }

  const { rows: users, count } = await User.findAndCountAll({
    where,
    attributes: ["id", "username", "email", "isActive", "createdAt"],
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName", "phoneNumber", "avatar"],
      },
    ],
    limit: parsedLimit,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
    subQuery: false,
  });

  const managerIds = users.map((user) => user.id);
  const branchRows = managerIds.length
    ? await sequelize.query(
      `
        SELECT bm.managerId, bm.branchId, b.branchName
        FROM BranchManagers bm
        INNER JOIN Branches b ON bm.branchId = b.id
        WHERE bm.managerId IN (:managerIds)
        ORDER BY b.branchName ASC
      `,
      {
        replacements: { managerIds },
        type: QueryTypes.SELECT,
      },
    )
    : [];

  const branchesByManager = branchRows.reduce((acc, row) => {
    if (!acc[row.managerId]) acc[row.managerId] = [];
    acc[row.managerId].push({
      branchManagerId: null,
      branchId: row.branchId,
      branchName: row.branchName,
      assignedDate: null,
    });
    return acc;
  }, {});

  const managers = users.map((u) => {
    const user = u.toJSON();
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      fullName: user.profile?.fullName,
      phoneNumber: user.profile?.phoneNumber,
      avatar: user.profile?.avatar,
      managedBranches: branchesByManager[user.id] || [],
    };
  });

  const [totalManagers, activeManagers, unassignedRows] = await Promise.all([
    User.count({ where: { roleId: managerRole.id } }),
    User.count({ where: { roleId: managerRole.id, isActive: true } }),
    sequelize.query(
      `
        SELECT COUNT(*) AS total
        FROM Users u
        WHERE u.roleId = :roleId
          AND NOT EXISTS (
            SELECT 1
            FROM BranchManagers bm
            WHERE bm.managerId = u.id
          )
      `,
      {
        replacements: { roleId: managerRole.id },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  return {
    managers,
    pagination: { page: parsedPage, limit: parsedLimit, total: count },
    stats: {
      total: totalManagers,
      active: activeManagers,
      locked: totalManagers - activeManagers,
      unassigned: Number(unassignedRows?.[0]?.total || 0),
    },
  };
};

const getBranchManagersService = async (branchId) => {
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");

  const records = await BranchManager.findAll({
    where: { branchId, isActive: true },
    include: [
      {
        model: User,
        as: "manager",
        attributes: ["id", "username", "email", "isActive"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber", "avatar"],
          },
        ],
      },
    ],
    attributes: ["id", "managerId", "isActive", "createdAt", "note"],
    order: [["createdAt", "DESC"]],
  });

  return records.map((r) => {
    const record = r.toJSON();
    return {
      branchManagerId: record.id,
      managerId: record.managerId,
      username: record.manager?.username,
      email: record.manager?.email,
      isActive: record.manager?.isActive,
      fullName: record.manager?.profile?.fullName,
      phoneNumber: record.manager?.profile?.phoneNumber,
      avatar: record.manager?.profile?.avatar,
      createdAt: record.createdAt,
      note: record.note,
    };
  });
};

const getBranchManagerHistoryService = async (branchId) => {
  const branch = await Branch.findByPk(branchId, {
    attributes: ["id", "branchName"],
  });
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");

  const records = await BranchManager.findAll({
    where: { branchId },
    include: [
      {
        model: User,
        as: "manager",
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
    attributes: ["id", "managerId", "isActive", "createdAt", "revokedDate", "note"],
    order: [["createdAt", "DESC"]],
  });

  return {
    branchId: branch.id,
    branchName: branch.branchName,
    history: records.map((r) => {
      const record = r.toJSON();
      return {
        branchManagerId: record.id,
        managerId: record.managerId,
        username: record.manager?.username,
        email: record.manager?.email,
        fullName: record.manager?.profile?.fullName,
        avatar: record.manager?.profile?.avatar,
        isActive: record.isActive,
        createdAt: record.createdAt,
        revokedDate: record.revokedDate,
        note: record.note,
      };
    }),
  };
};

const assignManagerToBranchService = async (data) => {
  const { branchId, managerId, note } = data;

  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError("Không tìm thấy chi nhánh");

  const user = await User.findByPk(managerId, {
    include: [{ model: Role, as: "role", attributes: ["roleName"] }],
  });
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");
  if (user.role?.roleName !== ROLE_NAME.MANAGER) {
    throw new BadRequestError("Người dùng phải có role Manager để được gán chi nhánh");
  }

  const existingBranchManager = await BranchManager.findOne({
    where: { branchId, isActive: true },
  });
  if (existingBranchManager) throw new ConflictError("Chi nhánh đã có Manager đang hoạt động. Vui lòng thu hồi trước khi gán mới.");

  const existing = await BranchManager.findOne({
    where: { branchId, managerId, isActive: true },
  });
  if (existing) throw new ConflictError("Manager này đã quản lý chi nhánh đó rồi");

  const record = await BranchManager.create({
    branchId,
    managerId,
    isActive: true,
    note: note || null,
  });

  return {
    branchManagerId: record.id,
    branchId: record.branchId,
    managerId: record.managerId,
    createdAt: record.createdAt,
  };
};

const revokeBranchManagerService = async (data) => {
  const { branchManagerId, note } = data;

  const record = await BranchManager.findOne({
    where: { id: branchManagerId, isActive: true },
  });
  if (!record) throw new NotFoundError("Không tìm thấy bản ghi quản lý hoặc đã bị thu hồi");

  await record.update({
    isActive: false,
    revokedDate: new Date(),
    note: note || record.note,
  });

  return { branchManagerId: record.id, revokedDate: record.revokedDate };
};

const changeUserRoleService = async (data) => {
  const { userId, newRole } = data;

  const allowedRoles = [ROLE_NAME.MANAGER, ROLE_NAME.USER, ROLE_NAME.COACH];
  if (!allowedRoles.includes(newRole)) {
    throw new BadRequestError("Role khong hop le");
  }

  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: "role", attributes: ["roleName"] }],
  });
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");
  if (user.role?.roleName === ROLE_NAME.ADMIN) {
    throw new BadRequestError("Không thể thay đổi role của Admin");
  }
  if (user.role?.roleName === newRole) {
    throw new BadRequestError(`Người dùng đã có role ${newRole} rồi`);
  }

  const targetRole = await Role.findOne({ where: { roleName: newRole } });
  if (!targetRole) throw new NotFoundError(`Không tìm thấy role ${newRole}`);

  // Nếu downgrade từ MANAGER xuống USER → thu hồi tất cả branch assignments
  if (newRole === ROLE_NAME.USER || newRole === ROLE_NAME.COACH) {
    await BranchManager.update(
      { isActive: false, revokedDate: new Date() },
      { where: { managerId: userId, isActive: true } },
    );
  }

  if (newRole === ROLE_NAME.COACH) {
    await CoachProfile.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        experienceYears: 0,
        certificate: null,
        certificateImages: [],
        introduction: null,
      },
    });
  }

  if (newRole !== ROLE_NAME.COACH && user.role?.roleName === ROLE_NAME.COACH) {
    await CoachProfile.destroy({ where: { userId } });
  }
  await user.update({ roleId: targetRole.id });

  return {
    id: user.id,
    username: user.username,
    newRole,
  };
};

const managerService = {
  getAllManagersService,
  getBranchManagersService,
  getBranchManagerHistoryService,
  assignManagerToBranchService,
  revokeBranchManagerService,
  changeUserRoleService,
};

export default managerService;
