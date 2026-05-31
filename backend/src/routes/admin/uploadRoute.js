import express from "express";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import uploadBuffer from "../../utils/cloudinary.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";
import BadRequestError from "../../errors/BadRequestError.js";

const adminUploadRoute = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh (PNG, JPG, WEBP)"));
    }
    cb(null, true);
  },
});

const initAdminUploadRoute = (app) => {
  adminUploadRoute.post(
    "/image",
    auth,
    authorize(ROLE_NAME.ADMIN),
    upload.single("image"),
    asyncHandler(async (req, res) => {
      if (!req.file) throw new BadRequestError("Không tìm thấy file ảnh");
      const result = await uploadBuffer(req.file.buffer, "admin-uploads");
      return res.json(new SuccessResponse("Upload ảnh thành công", { url: result.secure_url }));
    }),
  );

  app.use("/admin/upload", adminUploadRoute);
};

export default initAdminUploadRoute;
