import express from "express";
import workShiftEmployeeController from "../../controllers/admin/workShiftEmployeeController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  assignEmployeeToShiftSchema,
  getAllEmployeesMonthlySalarySchema,
  getEmployeesByShiftSchema,
  getWorkShiftEmployeeDetailSchema,
  removeEmployeeFromShiftSchema,
  updateEmployeeInShiftSchema,
} from "../../validations/workShiftEmployeeValidation.js";

const router = express.Router();

const initWorkShiftEmployeeRoute = (app) => {
  router.post(
    "/assign",
    auth,
    authorize("ADMIN"),
    validate(assignEmployeeToShiftSchema),
    workShiftEmployeeController.assignEmployeeToShift,
  );

  router.get(
    "/shift/:workShiftId",
    auth,
    authorize("ADMIN"),
    validate(getEmployeesByShiftSchema),
    workShiftEmployeeController.getEmployeesByShift,
  );

  router.put(
    "/update/:workShiftEmployeeId",
    auth,
    authorize("ADMIN"),
    validate(updateEmployeeInShiftSchema),
    workShiftEmployeeController.updateEmployeeInShift,
  );

  router.delete(
    "/remove/:workShiftEmployeeId",
    auth,
    authorize("ADMIN"),
    validate(removeEmployeeFromShiftSchema),
    workShiftEmployeeController.removeEmployeeFromShift,
  );

  router.get(
    "/all/monthly-salary",
    auth,
    authorize("ADMIN"),
    validate(getAllEmployeesMonthlySalarySchema),
    workShiftEmployeeController.getAllEmployeesMonthlySalary,
  );

  router.get(
    "/detail/:employeeId",
    auth,
    authorize("ADMIN"),
    validate(getWorkShiftEmployeeDetailSchema),
    workShiftEmployeeController.getWorkShiftEmployeeDetail,
  );
  app.use("/admin/work-shift-employee", router);
};

export default initWorkShiftEmployeeRoute;
