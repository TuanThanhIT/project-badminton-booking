import { User, Role } from "../../models/index.js";
import { Profile } from "../../models/index.js";
import bcrypt from "bcrypt";
import mailer from "../../helpers/mailer.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import sequelize from "../../config/db.js";

const createUserService = async (data) => {
  const { username, password, email } = data;
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new ConflictError(
      "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.",
    );
  }
  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    throw new ConflictError("Email đã được sử dụng cho tài khoản khác.");
  }
  const saltRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltRounds);
  const user = await User.create({
    username,
    email,
    password: hashPassword,
    roleId: 3,
  });
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    isVerified: user.isVerified,
    isActive: user.isActive,
    roleId: user.roleId,
    createdDate: user.createdDate,
    updatedDate: user.updatedDate,
  };
  return safeUser;
};

const lockUserService = (data) => {
  const { userId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại.");
    }
    await user.update({ isActive: false }, { transaction: t });
    t.afterCommit(() => {
      mailer
        .sendLockAccountMail(user.email, user.username)
        .catch((err) => console.error("Customer mail failed", err));
    });
    return user;
  });
};

const unlockUserService = async (data) => {
  const { userId } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("User không tồn tại");
    }
    await user.update({ isActive: true }, { transaction: t });
    t.afterCommit(() => {
      mailer
        .sendUnlockAccountMail(user.email, user.username)
        .catch((err) => console.error("Customer mail failed", err));
    });
    return user;
  });
};

const getAllUsersService = async () => {
  const users = await User.findAll({
    attributes: [
      "id",
      "username",
      "password",
      "email",
      "isVerified",
      "isActive",
    ],
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "roleName"],
      },
      {
        model: Profile,
        attributes: ["fullName", "dob", "gender", "address", "phoneNumber"],
      },
    ],
    order: [["createdDate", "DESC"]],
  });

  return users;
};

const getUsersByRoleService = async (data) => {
  const { roleId } = data;
  const users = await User.findAll({
    where: { roleId },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "roleName"],
      },
    ],
  });

  return users;
};

const getAllEmployeesService = async () => {
  const employees = await User.findAll({
    where: {
      roleId: 3,
      isActive: true,
    },
    attributes: ["id", "username"],
    include: [
      {
        model: Profile,
        attributes: ["fullName"],
      },
    ],
    order: [["createdDate", "DESC"]],
  });

  return employees;
};

const userService = {
  createUserService,
  lockUserService,
  unlockUserService,
  getAllUsersService,
  getUsersByRoleService,
  getAllEmployeesService,
};
export default userService;
