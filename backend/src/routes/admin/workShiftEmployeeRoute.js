import express from "express";
import workShiftEmployeeController from "../../controllers/admin/workShiftEmployeeController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const router = express.Router();

const initWorkShiftEmployeeRoute = (app) => {
  router.post(
    "/assign",
    auth,
    authorize("ADMIN"),
    workShiftEmployeeController.assignEmployeeToShift
  );

  router.get(
    "/shift/:workShiftId",
    auth,
    authorize("ADMIN"),
    workShiftEmployeeController.getEmployeesByShift
  );

  router.put(
    "/update/:id",
    auth,
    authorize("ADMIN"),
    workShiftEmployeeController.updateEmployeeInShift
  );

  router.delete(
    "/remove/:id",
    auth,
    authorize("ADMIN"),
    workShiftEmployeeController.removeEmployeeFromShift
  );

  router.get(
    "/all/monthly-salary",
    auth,
    authorize("ADMIN"),
    workShiftEmployeeController.getAllEmployeesMonthlySalary
  );

  router.get(
    "/detail/:id",
    auth,
    authorize("ADMIN"),
    workShiftEmployeeController.getWorkShiftEmployeeDetail
  );
  app.use("/admin/work-shift-employee", router);
};

export default initWorkShiftEmployeeRoute;
