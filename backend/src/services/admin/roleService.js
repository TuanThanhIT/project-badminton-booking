import { StatusCodes } from "http-status-codes";
import { Role } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";

const createRole = async (roleName) => {
  try {
    const existingRole = await Role.findOne({ where: { roleName } });
    if (existingRole) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Role đã tồn tại!");
    }
    const role = await Role.create({
      roleName,
    });
    return role;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
const roleService = {
  createRole,
};
export default roleService;
