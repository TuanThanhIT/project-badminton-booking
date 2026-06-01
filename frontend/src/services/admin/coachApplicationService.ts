import type { CoachApplicationListResponse, CoachApplicationResponse } from "../../types/coachApplication";
import instance from "../../utils/axiosCustomize";

const getApplicationsService = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) =>
  instance.get<CoachApplicationListResponse>("/admin/coach-applications", {
    params,
  });

const getApplicationDetailService = (id: number) =>
  instance.get<CoachApplicationResponse>(`/admin/coach-applications/${id}`);

const approveApplicationService = (id: number) =>
  instance.patch<CoachApplicationResponse>(
    `/admin/coach-applications/${id}/approve`,
  );

const rejectApplicationService = (id: number, rejectReason: string) =>
  instance.patch<CoachApplicationResponse>(
    `/admin/coach-applications/${id}/reject`,
    { rejectReason },
  );

const adminCoachApplicationService = {
  getApplicationsService,
  getApplicationDetailService,
  approveApplicationService,
  rejectApplicationService,
};

export default adminCoachApplicationService;
