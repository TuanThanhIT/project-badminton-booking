import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import draftController from "../../controllers/employee/draftController.js";

const draftRoute = express.Router();

const initDraftEmployeeRoute = (app) => {
  draftRoute.post(
    "/add",
    auth,
    authorize("EMPLOYEE"),
    draftController.createDraft
  );
  draftRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    draftController.getDrafts
  );
  draftRoute.post(
    "/update",
    auth,
    authorize("EMPLOYEE"),
    draftController.createAndUpdateDraft
  );
  draftRoute.get("/:id", auth, authorize("EMPLOYEE"), draftController.getDraft);
  app.use("/employee/draft", draftRoute);
};
export default initDraftEmployeeRoute;
