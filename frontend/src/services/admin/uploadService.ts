import instance from "../../utils/axiosCustomize";

const uploadImageService = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return instance.post<any>("/admin/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};

const adminUploadService = { uploadImageService };

export default adminUploadService;
