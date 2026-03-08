import { Role } from "../../models/index.js";
import ConflictError from "../../errors/ConflictError.js";

const createRoleService = async (data) => {
  const { roleName } = data;
  const existingRole = await Role.findOne({ where: { roleName } });
  if (existingRole) {
    throw new ConflictError("Role đã tồn tại");
  }
  const role = await Role.create({
    roleName,
  });
  return role;
};

const roleService = {
  createRoleService,
};
export default roleService;
