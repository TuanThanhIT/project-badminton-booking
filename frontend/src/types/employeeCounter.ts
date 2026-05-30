import type { ApiResponse } from "./api";
import type { CashRegister } from "./workShift";

export type CounterBranch = {
  id: number;
  branchName: string;
  address: string;
};

export type CounterSession = {
  assignmentId: number;
  workShiftId: number;
  employeeId: number;
  roleInShift: "CASHIER" | "STAFF" | string;
  checkIn: string;
  checkOut: string | null;
  canOperateCounter: boolean;
  cashRegister: CashRegister;
  branch: CounterBranch;
  workShift: {
    id: number;
    shiftName: string;
    workDate: string;
    startTime: string;
    endTime: string;
    shiftStatus: string;
  };
};

export type CounterProduct = {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  brand?: string;
  thumbnailUrl?: string;
  sku?: string;
  price: number;
  discount?: number;
  size?: string;
  color?: string;
  material?: string;
  stock: number;
};

export type CounterBeverage = {
  id: number;
  beverageId?: number;
  beverageName: string;
  thumbnailUrl?: string;
  price: number;
  stock: number;
};

export type CounterItem = (CounterProduct | CounterBeverage) & {
  type: "product" | "beverage";
  quantity: number;
};

export type CounterCourtSlot = {
  key: string;
  courtId: number;
  courtName: string;
  location: string;
  playDate: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "AVAILABLE" | "LOCKED";
  lockReason?: "PAST" | "BOOKED" | "NO_PRICE" | null;
  booking: null | {
    source: "BOOKING" | "MONTHLY" | "DRAFT";
    courtId: number;
    playDate: string;
    startTime: string;
    endTime: string;
    status: string;
    paymentStatus: string;
    customerName: string;
    customerPhone?: string;
    customerDisplay?: string;
    totalAmount: number;
    referenceId: number;
  };
};

export type CounterCourtBoard = {
  branch: CounterBranch;
  courts: {
    id: number;
    courtName: string;
    location: string;
    thumbnailUrl?: string;
  }[];
  timeSlots: {
    startTime: string;
    endTime: string;
    price: number;
  }[];
  slots: CounterCourtSlot[];
};

export type CounterDraft = {
  id: number;
  employeeId: number;
  branchId: number;
  nameCustomer: string;
  phoneNumber: string;
  note: string;
  draftBookingStatus: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  courtItems: {
    id: number;
    courtId: number;
    courtName: string;
    playDate: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  productItems: {
    id: number;
    productVariantId: number;
    productName: string;
    thumbnailUrl?: string;
    size?: string;
    color?: string;
    material?: string;
    sku?: string;
    price: number;
    quantity: number;
    subTotal: number;
  }[];
  beverageItems: {
    id: number;
    beverageId: number;
    beverageName: string;
    thumbnailUrl?: string;
    price: number;
    quantity: number;
    subTotal: number;
  }[];
  offlineBooking: null | {
    id: number;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
    paidAt: string | null;
  };
};

export type UpdateCounterDraftRequest = {
  nameCustomer?: string;
  phoneNumber?: string;
  note?: string;
  courtItems: {
    courtId: number;
    playDate: string;
    startTime: string;
    endTime: string;
  }[];
  productItems: {
    productVariantId: number;
    quantity: number;
  }[];
  beverageItems: {
    beverageId: number;
    quantity: number;
  }[];
};

export type CheckoutCounterDraftRequest = {
  paymentMethod: "CASH" | "VNPAY" | "BANK";
};

export type CounterSessionResponse = ApiResponse<CounterSession>;
export type CounterProductsResponse = ApiResponse<CounterProduct[]>;
export type CounterBeveragesResponse = ApiResponse<CounterBeverage[]>;
export type CounterCourtBoardResponse = ApiResponse<CounterCourtBoard>;
export type CounterDraftsResponse = ApiResponse<CounterDraft[]>;
export type CounterDraftResponse = ApiResponse<CounterDraft>;
export type DeleteCounterDraftResponse = ApiResponse<null>;
