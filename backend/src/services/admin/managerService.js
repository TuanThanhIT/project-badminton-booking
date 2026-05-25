import sequelize from "../../config/db.js";
import {
  User,
  Profile,
  Role,
  BranchManager,
  Branch,
} from "../../models/index.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";

const getAllManagersService = async (data = {}) => {
  const { search } = data;

  const managerRole = await Role.findOne({ where: { roleName: ROLE_NAME.MANAGER } });
  if (!managerRole) return [];

  const where = { roleId: managerRole.id };

  const users = await User.findAll({
    where,
    attributes: ["id", "username", "email", "isActive", "createdDate"],
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName", "phoneNumber", "avatar"],
      },
      {
        model: BranchManager,
        as: "branchManagers",
        where: { isActive: true },
        required: false,
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branchName"],
          },
        ],
        attributes: ["id", "branchId", "assignedDate"],
      },
    ],
    order: [["createdDate", "DESC"]],
  });

  return users.map((u) => {
    const user = u.toJSON();
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      createdDate: user.createdDate,
      fullName: user.profile?.fullName,
      phoneNumber: user.profile?.phoneNumber,
      avatar: user.profile?.avatar,
      managedBranches: user.branchManagers?.map((bm) => ({
        branchManagerId: bm.id,
        branchId: bm.branchId,
        branchName: bm.branch?.branchName,
        assignedDate: bm.assignedDate,
      })) || [],
    };
  });
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
    attributes: ["id", "managerId", "isActive", "assignedDate", "note"],
    order: [["assignedDate", "DESC"]],
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
      assignedDate: record.assignedDate,
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
    attributes: ["id", "managerId", "isActive", "assignedDate", "revokedDate", "note"],
    order: [["assignedDate", "DESC"]],
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
        assignedDate: record.assignedDate,
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
    assignedDate: record.assignedDate,
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

  const allowedRoles = [ROLE_NAME.MANAGER, ROLE_NAME.USER];
  if (!allowedRoles.includes(newRole)) {
    throw new BadRequestError("Chỉ được đổi role giữa USER và MANAGER");
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
  if (newRole === ROLE_NAME.USER) {
    await BranchManager.update(
      { isActive: false, revokedDate: new Date() },
      { where: { managerId: userId, isActive: true } },
    );
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
