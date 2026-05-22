import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CheckInRequest,
  CheckInResponse,
  CheckOutRequest,
  CheckOutResponse,
  CurrentWorkShiftRequest,
  CurrentWorkShiftResponse,
  EmployeeWorkShift,
  ShiftAssignment,
  ShiftAssignmentsRequest,
  ShiftAssignmentsResponse,
  UpdateShiftAssignmentRequest,
  UpdateShiftAssignmentResponse,
  WorkShiftByDateRequest,
  WorkShiftListResponse,
} from "../../../types/workShift";
import workShiftService from "../../../services/employee/workShiftService";

type WorkShiftState = {
  workShifts: EmployeeWorkShift[];
  currentWorkShift: EmployeeWorkShift | null;
  shiftAssignments: ShiftAssignment[];
};

const initialState: WorkShiftState = {
  workShifts: [],
  currentWorkShift: null,
  shiftAssignments: [],
};

export const getEmployeeWorkShifts = createAsyncThunk<
  WorkShiftListResponse,
  { data: WorkShiftByDateRequest },
  { rejectValue: ApiErrorType }
>("employeeWorkShift/getEmployeeWorkShifts", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await workShiftService.getWorkShiftsService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCurrentEmployeeWorkShift = createAsyncThunk<
  CurrentWorkShiftResponse,
  { data: CurrentWorkShiftRequest },
  { rejectValue: ApiErrorType }
>(
  "employeeWorkShift/getCurrentEmployeeWorkShift",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await workShiftService.getCurrentWorkShiftService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

export const checkInEmployeeWorkShift = createAsyncThunk<
  CheckInResponse,
  { data: CheckInRequest },
  { rejectValue: ApiErrorType }
>("employeeWorkShift/checkInEmployeeWorkShift", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await workShiftService.updateCheckInService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const checkOutEmployeeWorkShift = createAsyncThunk<
  CheckOutResponse,
  { data: CheckOutRequest },
  { rejectValue: ApiErrorType }
>(
  "employeeWorkShift/checkOutEmployeeWorkShift",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await workShiftService.updateCheckOutService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

export const getShiftAssignments = createAsyncThunk<
  ShiftAssignmentsResponse,
  { data: ShiftAssignmentsRequest },
  { rejectValue: ApiErrorType }
>("employeeWorkShift/getShiftAssignments", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await workShiftService.getShiftAssignmentsService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateShiftAssignment = createAsyncThunk<
  UpdateShiftAssignmentResponse,
  { data: UpdateShiftAssignmentRequest },
  { rejectValue: ApiErrorType }
>(
  "employeeWorkShift/updateShiftAssignment",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await workShiftService.updateShiftAssignmentService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

const workShiftSlice = createSlice({
  name: "employeeWorkShift",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeWorkShifts.fulfilled, (state, action) => {
        state.workShifts = action.payload.data;
      })
      .addCase(getCurrentEmployeeWorkShift.fulfilled, (state, action) => {
        state.currentWorkShift = action.payload.data;
      })
      .addCase(checkInEmployeeWorkShift.fulfilled, (state, action) => {
        state.currentWorkShift = action.payload.data;
        state.workShifts = state.workShifts.map((item) =>
          item.workShiftId === action.payload.data.workShiftId
            ? action.payload.data
            : item,
        );
      })
      .addCase(checkOutEmployeeWorkShift.fulfilled, (state, action) => {
        state.currentWorkShift = action.payload.data;
        state.workShifts = state.workShifts.map((item) =>
          item.workShiftId === action.payload.data.workShiftId
            ? action.payload.data
            : item,
        );
      })
      .addCase(getShiftAssignments.fulfilled, (state, action) => {
        state.shiftAssignments = action.payload.data;
      })
      .addCase(updateShiftAssignment.fulfilled, (state, action) => {
        const updatedAssignment = action.payload.data;

        state.shiftAssignments = state.shiftAssignments.map((item) =>
          item.assignmentId === updatedAssignment.assignmentId
            ? updatedAssignment
            : item,
        );

        const updatedShiftStatus = updatedAssignment.workShift?.shiftStatus;

        if (updatedShiftStatus) {
          if (
            state.currentWorkShift?.workShiftId === updatedAssignment.workShiftId
          ) {
            state.currentWorkShift.workShift.shiftStatus = updatedShiftStatus;
          }

          state.workShifts = state.workShifts.map((item) =>
            item.workShiftId === updatedAssignment.workShiftId
              ? {
                  ...item,
                  workShift: {
                    ...item.workShift,
                    shiftStatus: updatedShiftStatus,
                  },
                }
              : item,
          );
        }
      });
  },
});

export default workShiftSlice.reducer;
