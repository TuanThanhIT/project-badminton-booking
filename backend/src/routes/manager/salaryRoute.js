import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import salaryController from "../../controllers/manager/salaryController.js";

const salaryRoute = express.Router();

const initSalaryRoute = (app) => {
  salaryRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    salaryController.getMonthlySalary,
  );

  app.use("/manager/salaries", salaryRoute);
};

export default initSalaryRoute;
