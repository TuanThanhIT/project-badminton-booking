import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import managerEmployeeService from "../../../services/manager/employeeService";
import type {
  CreateEmployeeData,
  CreateEmployeeRequest,
  ManagerEmployee,
} from "../../../types/employee";
import type { ApiErrorType } from "../../../types/error";

type EmployeeState = {
  loading: boolean;
  employees: ManagerEmployee[];
};

const initialState: EmployeeState = {
  loading: false,
  employees: [],
};

const mapCreatedEmployee = (data: CreateEmployeeData): ManagerEmployee => ({
  branchId: data.branchId,
  employeeId: data.employee.id,
  username: data.employee.username,
  email: data.employee.email,
  isActive: data.employee.isActive,
  createdDate: data.employee.createdDate,
  fullName: data.profile?.fullName,
  phoneNumber: data.profile?.phoneNumber,
  address: data.profile?.address,
  gender: data.profile?.gender,
  avatar: data.profile?.avatar,
  level: data.profile?.level,
});

export const getEmployees = createAsyncThunk<
  ManagerEmployee[],
  void,
  { rejectValue: ApiErrorType }
>("managerEmployee/getEmployees", async (_, { rejectWithValue }) => {
  try {
    const res = await managerEmployeeService.getEmployeesService();

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createEmployee = createAsyncThunk<
  CreateEmployeeData,
  CreateEmployeeRequest,
  { rejectValue: ApiErrorType }
>("managerEmployee/createEmployee", async (data, { rejectWithValue }) => {
  try {
    const res = await managerEmployeeService.createEmployeeService(data);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const employeeSlice = createSlice({
  name: "managerEmployee",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(getEmployees.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = [mapCreatedEmployee(action.payload), ...state.employees];
      })
      .addCase(createEmployee.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default employeeSlice.reducer;
