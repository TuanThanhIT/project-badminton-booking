import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminManagerController from "../../controllers/admin/managerController.js";

const adminManagerRoute = express.Router();

const initAdminManagerRoute = (app) => {
  // Danh sách tất cả manager trong hệ thống
  adminManagerRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminManagerController.getAllManagersController,
  );

  // Danh sách manager hiện tại của chi nhánh
  adminManagerRoute.get(
    "/branches/:branchId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminManagerController.getBranchManagersController,
  );

  // Lịch sử manager của chi nhánh
  adminManagerRoute.get(
    "/branches/:branchId/history",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminManagerController.getBranchManagerHistoryController,
  );

  // Gán manager cho chi nhánh
  adminManagerRoute.post(
    "/branches/:branchId/assign",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminManagerController.assignManagerController,
  );

  // Thu hồi quyền manager khỏi chi nhánh
  adminManagerRoute.put(
    "/revoke/:branchManagerId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminManagerController.revokeManagerController,
  );

  // Thay đổi role người dùng (USER ↔ MANAGER)
  adminManagerRoute.put(
    "/users/:userId/change-role",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminManagerController.changeUserRoleController,
  );

  app.use("/admin/managers", adminManagerRoute);
};

export default initAdminManagerRoute;
