import roleService from "../../services/admin/roleService.js";

const createRole = async (req, res, next) => {
  try {
    const { roleName } = req.body;
    const role = await roleService.createRole(roleName);
    return res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};
const roleController = {
  createRole,
};
export default roleController;
