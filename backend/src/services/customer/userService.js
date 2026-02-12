import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError.js";
import { Profile } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getProfileService = async (data) => {
  const { userId } = data;

  const profile = await Profile.findOne({
    where: { userId },
    attributes: { exclude: ["userId"] },
  });

  if (!profile) {
    throw new NotFoundError("Profile chưa được khởi tạo");
  }

  return profile;
};

const updateProfileService = async (data) => {
  const { updateData, userId } = data;

  return sequelize.transaction(async (t) => {
    const profile = await Profile.findOne({
      where: { userId },
      attributes: { exclude: ["userId"] },
      transaction: t,
    });
    if (!profile) {
      throw new NotFoundError("Profile chưa được khởi tạo");
    }

    await profile.update(updateData, { transaction: t });

    return profile;
  });
};

const updateUserInfoService = async (data) => {
  const { updateUserData, userId } = data;
  return sequelize.transaction(async (t) => {
    const profile = await Profile.findOne({
      where: { userId },
      attributes: { exclude: ["userId"] },
      transaction: t,
    });
    if (!profile) {
      throw new NotFoundError("Profile chưa được khởi tạo");
    }
    await profile.update(updateUserData, { transaction: t });
    return profile;
  });
};

const userService = {
  getProfileService,
  updateProfileService,
  updateUserInfoService,
};
export default userService;
