import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import {
  type Address,
  type AddUserAddressRequest,
  type AddUserAddressResponse,
  type DeleteUserAddressRequest,
  type DeleteUserAddressResponse,
  type UpdateUserAddressRequest,
  type UpdateUserAddressResponse,
  type UserAddress,
  type UserAddressResponse,
} from "../../../types/address";
import addressService from "../../../services/user/addressService";

interface UserAddressState {
  userAddresses?: UserAddress;
  userAddress?: Address;
  prevUserAddress?: Address;
  selectedAddress?: Address;
}

const initialState: UserAddressState = {
  userAddresses: undefined,
  userAddress: undefined,
  prevUserAddress: undefined,
  selectedAddress: undefined,
};

export const getUserAddress = createAsyncThunk<
  UserAddressResponse,
  void,
  { rejectValue: ApiErrorType }
>("address/getUserAddress", async (_, { rejectWithValue }) => {
  try {
    const res = await addressService.getUserAddressService();
    return res.data as UserAddressResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const addUserAddress = createAsyncThunk<
  AddUserAddressResponse,
  { data: AddUserAddressRequest },
  { rejectValue: ApiErrorType }
>("address/addUserAddress", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await addressService.addUserAddressService(data);
    return res.data as AddUserAddressResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateUserAddress = createAsyncThunk<
  UpdateUserAddressResponse,
  { data: UpdateUserAddressRequest },
  { rejectValue: ApiErrorType }
>("address/updateUserAddress", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await addressService.updateUserAddressService(data);
    return res.data as UpdateUserAddressResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteUserAddress = createAsyncThunk<
  DeleteUserAddressResponse,
  { data: DeleteUserAddressRequest },
  { rejectValue: ApiErrorType }
>("address/deleteUserAddress", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await addressService.deleteUserAddressService(data);
    return res.data as DeleteUserAddressResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    updateUserAddressLocal(
      state,
      action: PayloadAction<{ data: UpdateUserAddressRequest }>,
    ) {
      const updateData = Object.fromEntries(
        Object.entries(action.payload.data).filter(([_, v]) => v !== undefined),
      );
      const { addressId, ...payload } = updateData;

      if (!state.userAddresses?.addresses) return;
      const idx = state.userAddresses?.addresses.findIndex(
        (item) => item.id === addressId,
      );
      if (idx >= 0) {
        state.prevUserAddress = { ...state.userAddresses.addresses[idx] };
        if (payload.isDefault) {
          state.userAddresses.addresses.forEach((addr) => {
            addr.isDefault = false;
          });
        }
        Object.assign(state.userAddresses.addresses[idx], payload);
        // state.userAddresses[idx] = {
        //   ...state.userAddresses[idx],
        //   ...payload,
        // };
      }
    },
    deleteUserAddressLocal(
      state,
      action: PayloadAction<{ data: DeleteUserAddressRequest }>,
    ) {
      if (!state.userAddresses?.addresses) return;

      const id = action.payload.data.addressId;

      const item = state.userAddresses.addresses.find((item) => item.id === id);

      if (item?.isDefault === false) {
        if (!state.prevUserAddress) {
          state.prevUserAddress = item ? { ...item } : undefined;
        }
        state.userAddresses.addresses = state.userAddresses.addresses.filter(
          (item) => item.id !== id,
        );
      }
    },
    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserAddress.fulfilled, (state, action) => {
        state.userAddresses = action.payload.data;
      })

      .addCase(addUserAddress.fulfilled, (state, action) => {
        if (!state.userAddresses?.addresses) return;
        if (action.payload.data.isDefault === true) {
          const idx = state.userAddresses.addresses.findIndex(
            (item) => item.isDefault === true,
          );
          if (idx >= 0) {
            state.userAddresses.addresses[idx].isDefault = false;
          }
        }

        state.userAddresses.addresses.push(action.payload.data);
        state.userAddresses.hasDefault = true;
      })

      .addCase(updateUserAddress.fulfilled, (state) => {
        state.prevUserAddress = undefined;
      })
      .addCase(updateUserAddress.rejected, (state) => {
        if (!state.prevUserAddress) return;
        if (!state.userAddresses?.addresses) return;
        const idx = state.userAddresses.addresses.findIndex(
          (item) => item.id === state.prevUserAddress?.id,
        );
        if (idx >= 0) {
          state.userAddresses.addresses[idx] = state.prevUserAddress;
        }
        state.prevUserAddress = undefined;
      })

      .addCase(deleteUserAddress.fulfilled, (state) => {
        state.prevUserAddress = undefined;
      })
      .addCase(deleteUserAddress.rejected, (state) => {
        if (!state.userAddresses?.addresses) return;
        if (state.prevUserAddress !== undefined) {
          state.userAddresses.addresses.push(state.prevUserAddress);
          state.prevUserAddress = undefined;
        }
      });
  },
});

export const {
  deleteUserAddressLocal,
  updateUserAddressLocal,
  setSelectedAddress,
} = addressSlice.actions;
export default addressSlice.reducer;
