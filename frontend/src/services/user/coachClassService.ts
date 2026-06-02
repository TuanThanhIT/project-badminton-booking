import type {
  ClassEnrollmentResponse,
  ClassStatusResponse,
  CoachClassesResponse,
  CoachDashboardResponse,
  ConversationIdResponse,
  EnrollmentsResponse,
  NotifyClassResponse,
  PostEnrollmentContextResponse,
} from "../../types/coachClass";
import instance from "../../utils/axiosCustomize";

const getDashboardService = () =>
  instance.get<CoachDashboardResponse>("/user/coach-classes/dashboard");

const getCoachClassesService = () =>
  instance.get<CoachClassesResponse>("/user/coach-classes/classes");

const getCoachEnrollmentsService = (params?: {
  page?: number;
  limit?: number;
  postId?: number;
  status?: string;
}) =>
  instance.get<EnrollmentsResponse>("/user/coach-classes/enrollments", { params });

const getMyEnrollmentsService = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) =>
  instance.get<EnrollmentsResponse>("/user/coach-classes/my-enrollments", {
    params,
  });

const getPostEnrollmentContextService = (postId: number) =>
  instance.get<PostEnrollmentContextResponse>(
    `/user/coach-classes/posts/${postId}/context`,
  );

const enrollInClassService = (postId: number) =>
  instance.post<ClassEnrollmentResponse>(
    `/user/coach-classes/posts/${postId}/enroll`,
  );

const updateEnrollmentService = (
  enrollmentId: number,
  data: {
    status: string;
    coachNote?: string;
    rejectReason?: string;
  },
) =>
  instance.patch<ClassEnrollmentResponse>(
    `/user/coach-classes/enrollments/${enrollmentId}`,
    data,
  );

const cancelEnrollmentService = (enrollmentId: number) =>
  instance.patch<ClassEnrollmentResponse>(
    `/user/coach-classes/enrollments/${enrollmentId}/cancel`,
  );

const addMemberManuallyService = (postId: number, studentUserId: number) =>
  instance.post<ClassEnrollmentResponse>(
    `/user/coach-classes/posts/${postId}/members`,
    { studentUserId },
  );

const getOrCreateClassConversationService = (postId: number) =>
  instance.post<ConversationIdResponse>(
    `/user/coach-classes/posts/${postId}/conversation`,
  );

const notifyClassMembersService = (
  postId: number,
  data: { title?: string; message: string; alsoSendChat?: boolean },
) =>
  instance.post<NotifyClassResponse>(
    `/user/coach-classes/posts/${postId}/notify`,
    data,
  );

const updateClassStatusService = (
  postId: number,
  action: "lock" | "unlock" | "end",
) =>
  instance.patch<ClassStatusResponse>(`/user/coach-classes/posts/${postId}/status`, {
    action,
  });

const coachClassService = {
  getDashboardService,
  getCoachClassesService,
  getCoachEnrollmentsService,
  getMyEnrollmentsService,
  getPostEnrollmentContextService,
  enrollInClassService,
  updateEnrollmentService,
  cancelEnrollmentService,
  addMemberManuallyService,
  getOrCreateClassConversationService,
  notifyClassMembersService,
  updateClassStatusService,
};

export default coachClassService;
