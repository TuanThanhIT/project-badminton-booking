import instance from "../../utils/axiosCustomize";
import type {
  CheckoutCounterDraftRequest,
  CounterBeveragesResponse,
  CounterCourtBoardResponse,
  CounterDraftResponse,
  CounterDraftsResponse,
  CounterProductsResponse,
  CounterSessionResponse,
  DeleteCounterDraftResponse,
  UpdateCounterDraftRequest,
} from "../../types/employeeCounter";

const getSessionService = () =>
  instance.get<CounterSessionResponse>("/employee/counter/session");

const getProductsService = (keyword = "") =>
  instance.get<CounterProductsResponse>("/employee/counter/products", {
    params: { keyword },
  });

const getBeveragesService = (keyword = "") =>
  instance.get<CounterBeveragesResponse>("/employee/counter/beverages", {
    params: { keyword },
  });

const getCourtBoardService = (date: string) =>
  instance.get<CounterCourtBoardResponse>("/employee/counter/court-board", {
    params: { date },
  });

const getDraftsService = () =>
  instance.get<CounterDraftsResponse>("/employee/counter/drafts");

const createDraftService = (nameCustomer: string, phoneNumber: string) =>
  instance.post<CounterDraftResponse>("/employee/counter/drafts", {
    nameCustomer,
    phoneNumber,
  });

const updateDraftService = (draftId: number, data: UpdateCounterDraftRequest) =>
  instance.put<CounterDraftResponse>(`/employee/counter/drafts/${draftId}`, data);

const deleteDraftService = (draftId: number) =>
  instance.delete<DeleteCounterDraftResponse>(
    `/employee/counter/drafts/${draftId}`,
  );

const checkoutDraftService = (
  draftId: number,
  data: CheckoutCounterDraftRequest,
) =>
  instance.post<CounterDraftResponse>(
    `/employee/counter/drafts/${draftId}/checkout`,
    data,
  );

const counterService = {
  getSessionService,
  getProductsService,
  getBeveragesService,
  getCourtBoardService,
  getDraftsService,
  createDraftService,
  updateDraftService,
  deleteDraftService,
  checkoutDraftService,
};

export default counterService;
