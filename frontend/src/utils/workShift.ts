import type { EmployeeWorkShift } from "../types/workShift";

export const SHIFT_CHECKOUT_EARLY_MINUTES = 5;

type WorkShiftInfo = EmployeeWorkShift["workShift"];

const normalizeTime = (time: string) => (time.length === 5 ? `${time}:00` : time);

export const getShiftCheckoutWindowStart = (
  workShift?: WorkShiftInfo | null,
) => {
  if (!workShift?.workDate || !workShift.startTime || !workShift.endTime) {
    return null;
  }

  const shiftStart = new Date(
    `${workShift.workDate}T${normalizeTime(workShift.startTime)}`,
  );
  const shiftEnd = new Date(
    `${workShift.workDate}T${normalizeTime(workShift.endTime)}`,
  );

  if (Number.isNaN(shiftStart.getTime()) || Number.isNaN(shiftEnd.getTime())) {
    return null;
  }

  if (shiftEnd <= shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  return new Date(
    shiftEnd.getTime() - SHIFT_CHECKOUT_EARLY_MINUTES * 60 * 1000,
  );
};

export const isShiftCheckoutWindowOpen = (
  workShift?: WorkShiftInfo | null,
) => {
  const checkoutWindowStart = getShiftCheckoutWindowStart(workShift);
  if (!checkoutWindowStart) return false;

  return Date.now() >= checkoutWindowStart.getTime();
};
