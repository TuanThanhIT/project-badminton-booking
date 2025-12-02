export type AddOfflineBookingRequest = {
  draftId: number;
};

export type AddOfflineBookingResponse = {
  id: number;
  total: number;
  nameCustomer: string;
};

export type UpdateOfflineBookingRequest = {
  offlineBookingId: number;
  paymentMethod: string;
  total: number;
};

export type UpdateOfflineBookingResponse = {
  message: string;
};
