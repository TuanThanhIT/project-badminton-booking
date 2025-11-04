import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Profile } from "../../models/index.js";

const getProfileService = async (userId) => {
  try {
    const profile = await Profile.findOne({
      where: { userId },
      attributes: { exclude: ["userId"] },
    });
    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Profile chưa được tạo!");
    }

    return profile;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateProfileService = async (updateData, userId) => {
  try {
    const profile = await Profile.findOne({
      where: { userId },
      attributes: { exclude: ["userId"] },
    });
    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Profile chưa được tạo!");
    }
    profile.update(updateData);
    return profile;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateUserInfoService = async (updateUserData, userId) => {
  try {
    const profile = await Profile.findOne({
      where: { userId },
      attributes: { exclude: ["userId"] },
    });
    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Profile chưa được tạo!");
    }
    profile.update(updateUserData);
    return profile;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const userService = {
  getProfileService,
  updateProfileService,
  updateUserInfoService,
};
export default userService;
