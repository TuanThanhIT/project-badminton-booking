export type AddDraftBookingRequest = {
  nameCustomer: string;
};

export type AddDraftBookingResponse = {
  message: string;
};

export type DraftBookingListResponse = {
  id: number;
  nameCustomer: string;
  note: string;
  status: string;
  currentStatus: string;
  total: number;
}[];

export type UpdateDraftBookingResponse = {
  message: string;
};

export type UpdateDraftBookingRequest = {
  draftId: number;
  note: string;
  total: number;
  courtSchedules: {
    courtScheduleId: number;
    price: number;
  }[];
  products: {
    productVarientId: number;
    quantity: number;
    subTotal: number;
  }[];
  beverages: {
    beverageId: number;
    quantity: number;
    subTotal: number;
  }[];
};

export type DraftBookingRequest = {
  draftId: number;
};

export type DraftBookingResponse = {
  id: number;
  note: string;
  total: number;
  courtSchedules: {
    courtScheduleId: number;
    courtName: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  beverages: {
    beverageId: number;
    name: string;
    price: number;
    quantity: number;
    subTotal: number;
  }[];
  products: {
    productVarientId: number;
    productName: string;
    price: number;
    quantity: number;
    subTotal: number;
  }[];
};
