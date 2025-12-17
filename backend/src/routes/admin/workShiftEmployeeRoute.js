import express from "express";
import workShiftEmployeeController from "../../controllers/admin/workShiftEmployeeController.js";
// import auth from "../../middlewares/auth.js";
// import authorize from "../../middlewares/authorize.js";

const router = express.Router();

const initWorkShiftEmployeeRoute = (app) => {
  router.post(
    "/assign",
    // auth,
    // authorize(),
    workShiftEmployeeController.assignEmployeeToShift
  );

  router.get(
    "/shift/:workShiftId",
    workShiftEmployeeController.getEmployeesByShift
  );

  router.put("/update/:id", workShiftEmployeeController.updateEmployeeInShift);

  router.delete(
    "/remove/:id",
    workShiftEmployeeController.removeEmployeeFromShift
  );

  app.use("/admin/work-shift-employee", router);
};

export default initWorkShiftEmployeeRoute;
