import express from "express";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import {
  createCourtSchema,
  createCourtPriceSchema,
} from "../../validations/courtValidation.js";
import courtController from "../../controllers/manager/courtController.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import uploadBuffer from "../../utils/cloudinary.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";
import BadRequestError from "../../errors/BadRequestError.js";

const courtRoute = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chi chap nhan file anh"));
    }
    cb(null, true);
  },
});

const initCourtRoute = (app) => {
  courtRoute.post(
    "/upload-image",
    auth,
    authorize(ROLE_NAME.MANAGER),
    upload.single("image"),
    asyncHandler(async (req, res) => {
      if (!req.file) throw new BadRequestError("Khong tim thay file anh");
      const result = await uploadBuffer(req.file.buffer, "court-uploads");
      return res
        .status(200)
        .json(new SuccessResponse("Upload anh san thanh cong", { url: result.secure_url }));
    }),
  );

  courtRoute.post(
    "/",
    auth,
    authorize("MANAGER"),
    validate(createCourtSchema),
    courtController.createCourtController,
  );
  courtRoute.post(
    "/prices",
    auth,
    authorize("MANAGER"),
    validate(createCourtPriceSchema),
    courtController.createCourtPriceController,
  );
  courtRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    courtController.getCourtsController,
  );
  courtRoute.get(
    "/prices",
    auth,
    authorize("MANAGER"),
    courtController.getCourtPricesController,
  );
  courtRoute.put(
    "/:courtId",
    auth,
    authorize("MANAGER"),
    courtController.updateCourtController,
  );

  courtRoute.patch(
    "/:courtId/maintenance",
    auth,
    authorize("MANAGER"),
    courtController.maintenanceCourtController,
  );

  courtRoute.patch(
    "/:courtId/close",
    auth,
    authorize("MANAGER"),
    courtController.closeCourtController,
  );
  app.use("/manager/courts", courtRoute);
};

export default initCourtRoute;
