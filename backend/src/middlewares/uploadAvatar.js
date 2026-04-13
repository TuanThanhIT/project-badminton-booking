import multer from "multer";

/** Ảnh đại diện profile — memory, tối đa 5MB */
const profileAvatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default profileAvatarUpload;
