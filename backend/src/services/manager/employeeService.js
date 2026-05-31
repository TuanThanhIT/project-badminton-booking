import bcrypt from "bcrypt";
import sequelize from "../../config/db.js";
import {
  User,
  Profile,
  Branch,
  Role,
  BranchEmployee,
  BranchManager,
} from "../../models/index.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const getBranchIdByManager = async (managerId, options = {}) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: {
      managerId,
      isActive: true,
    },
    raw: true,
    ...options,
  });

  if (!branchManager) {
    throw new Error("Manager has no active branch");
  }

  return branchManager.branchId;
};

const getEmployeesService = async (managerId) => {
  const branchId = await getBranchIdByManager(managerId);

  const branchEmployees = await BranchEmployee.findAll({
    where: { branchId },
    attributes: ["branchId", "employeeId"],
    include: [
      {
        model: User,
        as: "employee",
        attributes: ["id", "username", "email", "isActive", "createdDate"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: [
              "fullName",
              "phoneNumber",
              "address",
              "gender",
              "avatar",
              "level",
            ],
          },
        ],
      },
    ],
    order: [[{ model: User, as: "employee" }, "createdDate", "DESC"]],
  });

  return branchEmployees
    .filter((item) => item.employee)
    .map((item) => {
      const record = item.toJSON();
      const employee = record.employee;

      return {
        branchId: record.branchId,
        employeeId: record.employeeId,
        username: employee.username,
        email: employee.email,
        isActive: employee.isActive,
        createdDate: employee.createdDate,
        fullName: employee.profile?.fullName,
        phoneNumber: employee.profile?.phoneNumber,
        address: employee.profile?.address,
        gender: employee.profile?.gender,
        avatar: employee.profile?.avatar,
        level: employee.profile?.level,
      };
    });
};

const createEmployeeService = async ({
  managerId,
  username,
  email,
  password,
  fullName,
  phoneNumber,
  address,
  gender,
}) => {
  const t = await sequelize.transaction();

  try {
    const branchId = await getBranchIdByManager(managerId, {
      transaction: t,
    });

    const branch = await Branch.findByPk(branchId, {
      transaction: t,
    });

    if (!branch) {
      throw new Error("Branch not found");
    }

    const existedUser = await User.findOne({
      where: { email },
      transaction: t,
    });

    if (existedUser) {
      throw new Error("Email already exists");
    }

    const employeeRole = await Role.findOne({
      where: { roleName: ROLE_NAME.EMPLOYEE },
      transaction: t,
    });

    if (!employeeRole) {
      throw new Error("Employee role not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create(
      {
        username,
        email,
        password: hashedPassword,
        roleId: employeeRole.id,
        isVerified: true,
        isActive: true,
      },
      { transaction: t },
    );

    const profile = await Profile.create(
      {
        userId: employee.id,
        fullName,
        phoneNumber,
        address,
        gender,
      },
      { transaction: t },
    );

    await sequelize.query(
      `
  INSERT INTO BranchEmployees (branchId, employeeId)
  VALUES (:branchId, :employeeId)
  `,
      {
        replacements: {
          branchId: branch.id,
          employeeId: employee.id,
        },
        transaction: t,
      },
    );

    await t.commit();

    return {
      employee,
      profile,
      branchId: branch.id,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export default {
  getEmployeesService,
  createEmployeeService,
};
