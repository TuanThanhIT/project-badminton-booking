import type {
  AddOfflineBookingRequest,
  AddOfflineBookingResponse,
  UpdateOfflineBookingRequest,
} from "../../types/offline";
import instance from "../../utils/axiosCustomize";

const createOfflineBookingService = (data: AddOfflineBookingRequest) => {
  const { draftId } = data;
  return instance.post<AddOfflineBookingResponse>(
    `/employee/offline/add/${draftId}`
  );
};

const updateOfflineBookingService = (data: UpdateOfflineBookingRequest) => {
  const { offlineBookingId, paymentMethod, total } = data;
  return instance.patch(`/employee/offline/update/${offlineBookingId}`, {
    paymentMethod,
    total,
  });
};

const offlineBookingService = {
  createOfflineBookingService,
  updateOfflineBookingService,
};
export default offlineBookingService;
