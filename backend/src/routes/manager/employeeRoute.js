import express from "express";
import employeeController from "../../controllers/manager/employeeController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const employeeRoute = express.Router();

const initEmployeeRoute = (app) => {
  employeeRoute.post(
    "/",
    auth,
    authorize("MANAGER"),
    employeeController.createEmployee,
  );

  app.use("/manager/employees", employeeRoute);
};

export default initEmployeeRoute;
