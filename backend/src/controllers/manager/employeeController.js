import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import addressService from "../../services/user/addressService.js";
import employeeService from "../../services/manager/employeeService.js";

const getUserAddressController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const address = await addressService.getUserAddressService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Lay dia chi nguoi dung thanh cong", address));
});

const addUserAddressController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const userAddress = await addressService.addUserAddressService(data);

  return res
    .status(201)
    .json(new SuccessResponse("Them dia chi thanh cong", userAddress));
});

const updateUserAddressController = asyncHandler(async (req, res) => {
  const addressId = req.params.addressId;
  const updateData = { ...req.body };
  const userId = req.user.id;
  const data = { updateData, addressId, userId };
  const userAddress = await addressService.updateUserAddressService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Cap nhat dia chi thanh cong", userAddress));
});

const deleteUserAddressController = asyncHandler(async (req, res) => {
  const addressId = req.params.addressId;
  const userId = req.user.id;
  const data = { addressId, userId };
  await addressService.deleteUserAddressService(data);

  return res.status(200).json(new SuccessResponse("Xoa dia chi thanh cong"));
});

const createEmployee = asyncHandler(async (req, res) => {
  const managerId = req.user.id;
  const employee = await employeeService.createEmployeeService({
    managerId,
    ...req.body,
  });

  return res
    .status(201)
    .json(new SuccessResponse("Tao nhan vien thanh cong", employee));
});

const getEmployees = asyncHandler(async (req, res) => {
  const managerId = req.user.id;
  const employees = await employeeService.getEmployeesService(managerId);

  return res
    .status(200)
    .json(new SuccessResponse("Lay danh sach nhan vien thanh cong", employees));
});

export default {
  getUserAddressController,
  addUserAddressController,
  updateUserAddressController,
  deleteUserAddressController,
  getEmployees,
  createEmployee,
};
