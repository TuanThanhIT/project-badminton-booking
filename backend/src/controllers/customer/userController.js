import userService from "../../services/customer/userService.js";
import uploadBuffer from "../../utils/cloudinary.js";

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await userService.getProfileService(userId);
    return res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, dob, gender, address, phoneNumber } = req.body;
    // Nếu có file avatar
    let avatar;
    if (req.file?.buffer) {
      const uploaded = await uploadBuffer(req.file.buffer, "profiles");
      avatar = uploaded.secure_url;
    }

    // Tạo object chứa những trường tồn tại trong req.body
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (avatar) updateData.avatar = avatar;

    // Gọi service
    const profileUpdate = await userService.updateProfileService(
      updateData,
      userId
    );

    return res.status(200).json(profileUpdate);
  } catch (error) {
    next(error);
  }
};

const updateUserInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, address, phoneNumber } = req.body;

    // Tạo object chứa những trường tồn tại trong req.body
    const updateUserData = {};
    if (fullName !== undefined) updateUserData.fullName = fullName;
    if (address !== undefined) updateUserData.address = address;
    if (phoneNumber !== undefined) updateUserData.phoneNumber = phoneNumber;

    // Gọi service
    const profileUpdate = await userService.updateUserInfoService(
      updateUserData,
      userId
    );

    return res.status(200).json(profileUpdate);
  } catch (error) {
    next(error);
  }
};

const userController = {
  getProfile,
  updateProfile,
  updateUserInfo,
};
export default userController;
