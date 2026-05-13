import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import addressService from "../../services/user/addressService.js";

const getUserAddressController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const address = await addressService.getUserAddressService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy địa chỉ người dùng thành công", address));
});

const addUserAddressController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const userAddress = await addressService.addUserAddressService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Thêm địa chỉ thành công", userAddress));
});

const updateUserAddressController = asyncHandler(async (req, res) => {
  const addressId = req.params.addressId;
  const updateData = { ...req.body };
  const userId = req.user.id;
  const data = { updateData, addressId, userId };
  const userAddress = await addressService.updateUserAddressService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật địa chỉ thành công", userAddress));
});

const deleteUserAddressController = asyncHandler(async (req, res) => {
  const addressId = req.params.addressId;
  const userId = req.user.id;
  const data = { addressId, userId };
  await addressService.deleteUserAddressService(data);
  return res.status(200).json(new SuccessResponse("Xóa địa chỉ thành công"));
});

const addressController = {
  getUserAddressController,
  addUserAddressController,
  updateUserAddressController,
  deleteUserAddressController,
};

export default addressController;
