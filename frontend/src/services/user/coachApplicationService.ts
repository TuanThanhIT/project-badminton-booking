import type {
  CertificateUploadResponse,
  CoachApplicationResponse,
  SubmitCoachApplicationPayload,
} from "../../types/coachApplication";
import instance from "../../utils/axiosCustomize";

const getMyApplicationService = () =>
  instance.get<CoachApplicationResponse>("/user/coach-applications/me");

const submitApplicationService = (data: SubmitCoachApplicationPayload) =>
  instance.post<CoachApplicationResponse>("/user/coach-applications", data);

const uploadCertificateImagesService = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return instance.post<CertificateUploadResponse>(
    "/user/coach-applications/certificate-images",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
};

const coachApplicationService = {
  getMyApplicationService,
  submitApplicationService,
  uploadCertificateImagesService,
};

export default coachApplicationService;
