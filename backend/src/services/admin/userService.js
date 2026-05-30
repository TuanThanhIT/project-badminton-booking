import bcrypt from "bcrypt";
import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import { User, Profile, Role, BranchManager, Branch, Wallet } from "../../models/index.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import { WALLET_STATUS } from "../../constants/paymentConstant.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const saltRounds = 10;

const getUsersService = async (data) => {
  const { page = 1, limit = 10, search, role, isActive } = data;
  const offset = (page - 1) * limit;

  const userWhere = {};
  if (search) {
    userWhere[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  if (isActive !== undefined && isActive !== "") {
    userWhere.isActive = isActive === "true" || isActive === true;
  }

  const roleWhere = {};
  if (role) {
    roleWhere.roleName = role;
  }

  const { rows, count } = await User.findAndCountAll({
    where: userWhere,
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName", "phoneNumber", "avatar", "gender"],
      },
      {
        model: Role,
        as: "role",
        attributes: ["roleName"],
        where: Object.keys(roleWhere).length ? roleWhere : undefined,
      },
    ],
    attributes: ["id", "username", "email", "isVerified", "isActive", "createdAt"],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const users = rows.map((u) => {
    const user = u.toJSON();
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      role: user.role?.roleName,
      fullName: user.profile?.fullName,
      phoneNumber: user.profile?.phoneNumber,
      avatar: user.profile?.avatar,
      gender: user.profile?.gender,
    };
  });

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
  };
};

const getUserDetailService = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "username", "email", "isVerified", "isActive", "createdAt"],
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName", "phoneNumber", "avatar", "gender", "dob", "address", "level"],
      },
      {
        model: Role,
        as: "role",
        attributes: ["id", "roleName"],
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
            attributes: ["id", "branchName", "address"],
          },
        ],
        attributes: ["id", "branchId", "isActive", "createdAt"],
      },
    ],
  });

  if (!user) throw new NotFoundError("Không tìm thấy người dùng");

  const data = user.toJSON();
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    isVerified: data.isVerified,
    isActive: data.isActive,
    createdAt: data.createdAt,
    role: data.role?.roleName,
    profile: data.profile,
    managedBranches: data.branchManagers?.map((bm) => ({
      branchManagerId: bm.id,
      branchId: bm.branchId,
      branchName: bm.branch?.branchName,
      address: bm.branch?.address,
      createdAt: bm.createdAt,
    })) || [],
  };
};

const toggleUserActiveService = async (userId, adminId) => {
  if (Number(userId) === Number(adminId)) {
    throw new BadRequestError("Không thể khóa tài khoản của chính mình");
  }

  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: "role", attributes: ["roleName"] }],
  });

  if (!user) throw new NotFoundError("Không tìm thấy người dùng");
  if (user.role?.roleName === ROLE_NAME.ADMIN) {
    throw new BadRequestError("Không thể khóa tài khoản Admin");
  }

  await user.update({ isActive: !user.isActive });

  return {
    id: user.id,
    username: user.username,
    isActive: user.isActive,
  };
};

const createManagerService = async (data) => {
  const { username, email, password, fullName, phoneNumber } = data;

  const hashPassword = await bcrypt.hash(password, saltRounds);

  return sequelize.transaction(async (t) => {
    const existingUser = await User.findOne({ where: { username }, transaction: t });
    if (existingUser) throw new ConflictError("Tên đăng nhập đã tồn tại");

    const existingEmail = await User.findOne({ where: { email }, transaction: t });
    if (existingEmail) throw new ConflictError("Email đã được sử dụng");

    const managerRole = await Role.findOne({
      where: { roleName: ROLE_NAME.MANAGER },
      transaction: t,
    });
    if (!managerRole) throw new NotFoundError("Không tìm thấy role Manager");

    const user = await User.create(
      {
        username,
        email,
        password: hashPassword,
        roleId: managerRole.id,
        isVerified: true,
        isActive: true,
      },
      { transaction: t },
    );

    await Profile.create(
      {
        userId: user.id,
        fullName: fullName || username,
        phoneNumber: phoneNumber || "0000000000",
      },
      { transaction: t },
    );

    await Wallet.create({ userId: user.id, balance: 0, status: WALLET_STATUS.ACTIVE }, { transaction: t });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: ROLE_NAME.MANAGER,
    };
  });
};

const deleteManagerService = async (userId, adminId) => {
  if (Number(userId) === Number(adminId)) {
    throw new BadRequestError("Không thể xóa tài khoản của chính mình");
  }

  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: "role", attributes: ["roleName"] }],
  });

  if (!user) throw new NotFoundError("Không tìm thấy người dùng");
  if (user.role?.roleName === ROLE_NAME.ADMIN) {
    throw new BadRequestError("Không thể xóa tài khoản Admin");
  }

  await BranchManager.update(
    { isActive: false, revokedDate: new Date() },
    { where: { managerId: userId, isActive: true } },
  );

  await user.destroy();
  return { id: Number(userId) };
};

const userService = {
  getUsersService,
  getUserDetailService,
  toggleUserActiveService,
  createManagerService,
  deleteManagerService,
};

export default userService;
