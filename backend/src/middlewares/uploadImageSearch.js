import multer from "multer";

const imageSearchUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("File tìm kiếm phải là hình ảnh"));
    }
    return cb(null, true);
  },
});

export default imageSearchUpload;
