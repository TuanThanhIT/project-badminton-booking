import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import coachClassController from "../../controllers/user/coachClassController.js";
import {
  addMemberSchema,
  enrollmentIdParamSchema,
  getCoachEnrollmentsSchema,
  getMyEnrollmentsSchema,
  notifyClassSchema,
  postIdParamSchema,
  updateClassStatusSchema,
  updateEnrollmentSchema,
} from "../../validations/coachClassValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const coachClassRoute = express.Router();

const initCoachClassRoute = (app) => {
  coachClassRoute.get(
    "/dashboard",
    auth,
    authorize(ROLE_NAME.COACH),
    coachClassController.getCoachDashboardController,
  );

  coachClassRoute.get(
    "/classes",
    auth,
    authorize(ROLE_NAME.COACH),
    coachClassController.getCoachClassesController,
  );

  coachClassRoute.get(
    "/enrollments",
    auth,
    authorize(ROLE_NAME.COACH),
    validate(getCoachEnrollmentsSchema),
    coachClassController.getCoachEnrollmentsController,
  );

  coachClassRoute.get(
    "/my-enrollments",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getMyEnrollmentsSchema),
    coachClassController.getMyEnrollmentsController,
  );

  coachClassRoute.get(
    "/posts/:postId/context",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(postIdParamSchema),
    coachClassController.getPostEnrollmentContextController,
  );

  coachClassRoute.post(
    "/posts/:postId/enroll",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(postIdParamSchema),
    coachClassController.enrollInClassController,
  );

  coachClassRoute.patch(
    "/enrollments/:enrollmentId",
    auth,
    authorize(ROLE_NAME.COACH),
    validate(updateEnrollmentSchema),
    coachClassController.updateEnrollmentController,
  );

  coachClassRoute.patch(
    "/enrollments/:enrollmentId/cancel",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(enrollmentIdParamSchema),
    coachClassController.cancelEnrollmentController,
  );

  coachClassRoute.post(
    "/posts/:postId/members",
    auth,
    authorize(ROLE_NAME.COACH),
    validate(addMemberSchema),
    coachClassController.addMemberManuallyController,
  );

  coachClassRoute.post(
    "/posts/:postId/conversation",
    auth,
    authorize(ROLE_NAME.COACH),
    validate(postIdParamSchema),
    coachClassController.getOrCreateClassConversationController,
  );

  coachClassRoute.post(
    "/posts/:postId/notify",
    auth,
    authorize(ROLE_NAME.COACH),
    validate(notifyClassSchema),
    coachClassController.notifyClassMembersController,
  );

  coachClassRoute.patch(
    "/posts/:postId/status",
    auth,
    authorize(ROLE_NAME.COACH),
    validate(updateClassStatusSchema),
    coachClassController.updateClassStatusController,
  );

  app.use("/user/coach-classes", coachClassRoute);
};

export default initCoachClassRoute;
