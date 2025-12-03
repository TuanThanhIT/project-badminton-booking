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
