export type WorkShiftResponse = {
  id: number;
  name: string;
  workDate: string;
  startTime: string;
  endTime: string;
  shiftWage: number;
};

export type WorkShiftRequest = {
  date: string;
};

export type UpdateCheckIntRequest = {
  workShiftId: number;
  checkInTime: string;
  openCash: number;
};

export type UpdateCheckOutRequest = {
  workShiftId: number;
  checkOutTime: string;
  closeCash: number;
};

export type UpdateWorkShiftResponse = {
  message: string;
};
//Admin
export type WorkShiftItem = {
  id: number;
  name: string;
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  shiftWage: number;
};

export type CreateWorkShiftRequest = {
  workDate: string; // YYYY-MM-DD
  shiftWage: number;
};

export type WorkShiftListResponse = {
  workShifts: WorkShiftItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
