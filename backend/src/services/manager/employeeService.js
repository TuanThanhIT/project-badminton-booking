import bcrypt from "bcrypt";
import User from "../../models/user.js";
import Profile from "../../models/profile.js";
import Branch from "../../models/branch.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const createEmployeeService = async ({
  managerId,
  email,
  password,
  fullName,
  phoneNumber,
  address,
  gender,
}) => {
  // tìm chi nhánh của manager
  const branch = await Branch.findOne({
    where: {
      managerId,
    },
  });

  if (!branch) {
    throw new Error("Branch not found");
  }

  // check email tồn tại
  const existedUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existedUser) {
    throw new Error("Email already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // tạo user nhân viên
  const employee = await User.create({
    email,
    password: hashedPassword,
    role: ROLE_NAME.STAFF,
    branchId: branch.id,
  });

  // tạo profile nhân viên
  const profile = await Profile.create({
    userId: employee.id,
    fullName,
    phoneNumber,
    address,
    gender,
  });

  return {
    employee,
    profile,
  };
};

const employeeService = {
  createEmployeeService,
};

export default employeeService;
