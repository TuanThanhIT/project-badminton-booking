import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import draftController from "../../controllers/employee/draftController.js";
import validate from "../../middlewares/validate.js";
import {
  createAndUpdateDraftSchema,
  createDraftSchema,
  deleteDraftSchema,
  getDraftSchema,
} from "../../validations/draftValidation.js";

const draftRoute = express.Router();

const initDraftEmployeeRoute = (app) => {
  draftRoute.post(
    "/add",
    auth,
    authorize("EMPLOYEE"),
    validate(createDraftSchema),
    draftController.createDraft,
  );
  draftRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    draftController.getDrafts,
  );
  draftRoute.post(
    "/update",
    auth,
    authorize("EMPLOYEE"),
    validate(createAndUpdateDraftSchema),
    draftController.createAndUpdateDraft,
  );
  draftRoute.get(
    "/:draftId",
    auth,
    authorize("EMPLOYEE"),
    validate(getDraftSchema),
    draftController.getDraft,
  );
  draftRoute.delete(
    "/delete/:draftId",
    auth,
    authorize("EMPLOYEE"),
    validate(deleteDraftSchema),
    draftController.deleteDraft,
  );
  app.use("/employee/draft", draftRoute);
};
export default initDraftEmployeeRoute;
