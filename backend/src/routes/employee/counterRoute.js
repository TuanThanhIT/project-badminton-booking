import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import counterController from "../../controllers/employee/counterController.js";
import {
  checkoutEmployeeDraftSchema,
  createEmployeeDraftSchema,
  draftIdParamSchema,
  getEmployeeCourtBoardSchema,
  getEmployeeInventorySchema,
  updateEmployeeDraftSchema,
} from "../../validations/employeeCounterValidation.js";

const counterRoute = express.Router();

const employeeOnly = [auth, authorize(ROLE_NAME.EMPLOYEE)];

const initEmployeeCounterRoute = (app) => {
  counterRoute.get(
    "/session",
    employeeOnly,
    counterController.getSessionController,
  );

  counterRoute.get(
    "/products",
    employeeOnly,
    validate(getEmployeeInventorySchema),
    counterController.getProductsController,
  );

  counterRoute.get(
    "/beverages",
    employeeOnly,
    validate(getEmployeeInventorySchema),
    counterController.getBeveragesController,
  );

  counterRoute.get(
    "/court-board",
    employeeOnly,
    validate(getEmployeeCourtBoardSchema),
    counterController.getCourtBoardController,
  );

  counterRoute.get(
    "/drafts",
    employeeOnly,
    counterController.getDraftsController,
  );

  counterRoute.post(
    "/drafts",
    employeeOnly,
    validate(createEmployeeDraftSchema),
    counterController.createDraftController,
  );

  counterRoute.put(
    "/drafts/:draftId",
    employeeOnly,
    validate(updateEmployeeDraftSchema),
    counterController.updateDraftController,
  );

  counterRoute.delete(
    "/drafts/:draftId",
    employeeOnly,
    validate(draftIdParamSchema),
    counterController.deleteDraftController,
  );

  counterRoute.post(
    "/drafts/:draftId/checkout",
    employeeOnly,
    validate(checkoutEmployeeDraftSchema),
    counterController.checkoutDraftController,
  );

  app.use("/employee/counter", counterRoute);
};

export default initEmployeeCounterRoute;
