import type {
  GetMyProfileResponse,
  GetPublicProfileResponse,
  UpdateMyProfileRequest,
} from "../../types/profile";
import instance from "../../utils/axiosCustomize";

const getMyProfileService = () =>
  instance.get<GetMyProfileResponse>("/user/profile/me");

const updateMyProfileService = (data: UpdateMyProfileRequest) =>
  instance.patch<GetMyProfileResponse>("/user/profile/me", data);

const getPublicProfileService = (userId: number) =>
  instance.get<GetPublicProfileResponse>(`/user/profile/${userId}`);

const uploadMyAvatarService = (file: File) => {
  const body = new FormData();
  body.append("avatar", file);
  return instance.post<GetMyProfileResponse>("/user/profile/me/avatar", body, {
    timeout: 120000,
  });
};

const uploadCoachCertificateImagesService = (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append("images", file));
  return instance.post<GetMyProfileResponse>(
    "/user/profile/me/coach-certificates",
    body,
    { timeout: 120000 },
  );
};

const profileService = {
  getMyProfileService,
  updateMyProfileService,
  uploadMyAvatarService,
  uploadCoachCertificateImagesService,
  getPublicProfileService,
};

export default profileService;
