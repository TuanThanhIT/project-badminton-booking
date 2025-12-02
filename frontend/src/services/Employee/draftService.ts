import type {
  AddDraftBookingRequest,
  AddDraftBookingResponse,
  DraftBookingListResponse,
  DraftBookingRequest,
  DraftBookingResponse,
  UpdateDraftBookingRequest,
} from "../../types/draft";
import instance from "../../utils/axiosCustomize";

const createDraftService = (data: AddDraftBookingRequest) =>
  instance.post<AddDraftBookingResponse>("/employee/draft/add", data);

const getDraftsService = () =>
  instance.get<DraftBookingListResponse>("/employee/draft/list");

const createAndUpdateDraftService = (data: UpdateDraftBookingRequest) =>
  instance.post("/employee/draft/update", data);

const getDraftService = (data: DraftBookingRequest) => {
  const { draftId } = data;
  return instance.get<DraftBookingResponse>(`/employee/draft/${draftId}`);
};

const draftService = {
  createDraftService,
  getDraftsService,
  createAndUpdateDraftService,
  getDraftService,
};
export default draftService;
