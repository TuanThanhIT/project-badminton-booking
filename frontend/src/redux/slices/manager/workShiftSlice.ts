import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import managerWorkShiftService from "../../../services/manager/workShiftService";
import type { ApiErrorType } from "../../../types/error";
import type {
  AssignManagerShiftRequest,
  CreateManagerWorkShiftRequest,
  ManagerShiftAssignment,
  ManagerWorkShift,
  ManagerWorkShiftListData,
  ManagerWorkShiftQueries,
  RemoveManagerShiftAssignmentData,
  UpdateManagerShiftAssignmentRequest,
} from "../../../types/workShift";

///MANAGER
type ManagerWorkShiftState = {
  loading: boolean;
  actionLoading: boolean;
  branchId: number | null;
  workShifts: ManagerWorkShift[];
};

///MANAGER
const initialState: ManagerWorkShiftState = {
  loading: false,
  actionLoading: false,
  branchId: null,
  workShifts: [],
};

///MANAGER
export const getManagerWorkShifts = createAsyncThunk<
  ManagerWorkShiftListData,
  ManagerWorkShiftQueries | undefined,
  { rejectValue: ApiErrorType }
>("managerWorkShift/getManagerWorkShifts", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await managerWorkShiftService.getWorkShiftsService(params);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
export const createManagerWorkShift = createAsyncThunk<
  ManagerWorkShift,
  CreateManagerWorkShiftRequest,
  { rejectValue: ApiErrorType }
>("managerWorkShift/createManagerWorkShift", async (data, { rejectWithValue }) => {
  try {
    const res = await managerWorkShiftService.createWorkShiftService(data);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
export const assignManagerShiftEmployee = createAsyncThunk<
  ManagerShiftAssignment,
  AssignManagerShiftRequest,
  { rejectValue: ApiErrorType }
>("managerWorkShift/assignManagerShiftEmployee", async (data, { rejectWithValue }) => {
  try {
    const res = await managerWorkShiftService.assignEmployeeService(data);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
export const updateManagerShiftAssignment = createAsyncThunk<
  ManagerShiftAssignment,
  UpdateManagerShiftAssignmentRequest,
  { rejectValue: ApiErrorType }
>("managerWorkShift/updateManagerShiftAssignment", async (data, { rejectWithValue }) => {
  try {
    const res = await managerWorkShiftService.updateAssignmentService(data);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
export const removeManagerShiftAssignment = createAsyncThunk<
  RemoveManagerShiftAssignmentData,
  number,
  { rejectValue: ApiErrorType }
>("managerWorkShift/removeManagerShiftAssignment", async (assignmentId, { rejectWithValue }) => {
  try {
    const res = await managerWorkShiftService.removeAssignmentService(
      assignmentId,
    );

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const upsertAssignment = (
  shifts: ManagerWorkShift[],
  assignment: ManagerShiftAssignment,
) => {
  const shift = shifts.find((item) => item.id === assignment.workShiftId);
  if (!shift) return;

  const index = shift.assignments.findIndex(
    (item) => item.assignmentId === assignment.assignmentId,
  );

  if (index >= 0) {
    shift.assignments[index] = assignment;
    return;
  }

  shift.assignments.push(assignment);
};

///MANAGER
const workShiftSlice = createSlice({
  name: "managerWorkShift",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getManagerWorkShifts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerWorkShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.branchId = action.payload.branchId;
        state.workShifts = action.payload.workShifts;
      })
      .addCase(getManagerWorkShifts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createManagerWorkShift.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createManagerWorkShift.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.workShifts = [action.payload, ...state.workShifts];
      })
      .addCase(createManagerWorkShift.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(assignManagerShiftEmployee.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(assignManagerShiftEmployee.fulfilled, (state, action) => {
        state.actionLoading = false;
        upsertAssignment(state.workShifts, action.payload);
      })
      .addCase(assignManagerShiftEmployee.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateManagerShiftAssignment.fulfilled, (state, action) => {
        upsertAssignment(state.workShifts, action.payload);
      })
      .addCase(removeManagerShiftAssignment.fulfilled, (state, action) => {
        const shift = state.workShifts.find(
          (item) => item.id === action.payload.workShiftId,
        );
        if (!shift) return;

        shift.assignments = shift.assignments.filter(
          (item) => item.assignmentId !== action.payload.assignmentId,
        );
      });
  },
});

export default workShiftSlice.reducer;
