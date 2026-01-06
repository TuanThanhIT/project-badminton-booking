import {
  type AddDraftBookingRequest,
  type AddDraftBookingResponse,
  type DeleteDraftRequest,
  type DeleteDraftResponse,
  type DraftBookingListResponse,
  type DraftBookingRequest,
  type DraftBookingResponse,
  type UpdateDraftBookingRequest,
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

const deleteDraftService = (data: DeleteDraftRequest) => {
  const draftId = data.draftId;
  return instance.delete<DeleteDraftResponse>(
    `/employee/draft/delete/${draftId}`
  );
};

const draftService = {
  createDraftService,
  getDraftsService,
  createAndUpdateDraftService,
  getDraftService,
  deleteDraftService,
};
export default draftService;
