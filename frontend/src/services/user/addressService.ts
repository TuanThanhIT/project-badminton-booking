import type {
  AddUserAddressRequest,
  AddUserAddressResponse,
  DeleteUserAddressRequest,
  DeleteUserAddressResponse,
  UpdateUserAddressRequest,
  UpdateUserAddressResponse,
  UserAddressResponse,
} from "../../types/address";
import instance from "../../utils/axiosCustomize";

const getUserAddressService = () =>
  instance.get<UserAddressResponse>("/user/addresses");

const addUserAddressService = (data: AddUserAddressRequest) =>
  instance.post<AddUserAddressResponse>("/user/addresses", data);

const updateUserAddressService = (dt: UpdateUserAddressRequest) => {
  const { addressId, ...rest } = dt;
  const data = Object.fromEntries(
    Object.entries(rest).filter(([_, v]) => v !== undefined),
  );
  return instance.patch<UpdateUserAddressResponse>(
    `/user/addresses/${addressId}`,
    data,
  );
};

const deleteUserAddressService = (data: DeleteUserAddressRequest) => {
  const { addressId } = data;
  return instance.delete<DeleteUserAddressResponse>(
    `/user/addresses/${addressId}`,
  );
};

const addressService = {
  getUserAddressService,
  addUserAddressService,
  updateUserAddressService,
  deleteUserAddressService,
};

export default addressService;
