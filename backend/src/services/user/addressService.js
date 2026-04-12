import sequelize from "../../config/db.js";
import UserAddress from "../../models/userAddress.js";
import User from "../../models/user.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getUserAddressService = async (data) => {
  const { userId } = data;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }

  const addresses = await UserAddress.findAll({
    where: { userId },
    attributes: [
      "id",
      "label",
      "fullName",
      "phoneNumber",
      "address",
      "province",
      "district",
      "ward",
      "provinceCode",
      "districtCode",
      "wardCode",
      "latitude",
      "longitude",
      "isDefault",
    ],
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

  const hasDefault = addresses.some((addr) => addr.isDefault);

  return {
    hasDefault,
    addresses,
  };
};

const addUserAddressService = async (data) => {
  const {
    fullName,
    phoneNumber,
    address,
    province,
    district,
    ward,
    provinceCode,
    districtCode,
    wardCode,
    latitude,
    longitude,
    label,
    userId,
    isDefault,
  } = data;

  return sequelize.transaction(async (t) => {
    const addressCount = await UserAddress.count({
      where: { userId },
      transaction: t,
    });

    let defaultValue = isDefault;

    // nếu user chưa có địa chỉ nào → auto default
    if (addressCount === 0) {
      defaultValue = true;
    }

    // nếu địa chỉ mới được chọn làm default
    if (defaultValue) {
      await UserAddress.update(
        { isDefault: false },
        {
          where: { userId },
          transaction: t,
        },
      );
    }

    const userAddress = await UserAddress.create(
      {
        fullName,
        phoneNumber,
        address,
        province,
        district,
        ward,
        provinceCode,
        districtCode,
        wardCode,
        latitude,
        longitude,
        label,
        userId,
        isDefault: defaultValue,
      },
      { transaction: t },
    );

    const userAddressReturn = {
      id: userAddress.id,
      label: userAddress.label,
      fullName: userAddress.fullName,
      phoneNumber: userAddress.phoneNumber,
      address: userAddress.address,
      province: userAddress.province,
      district: userAddress.district,
      ward: userAddress.ward,
      provinceCode: userAddress.provinceCode,
      districtCode: userAddress.districtCode,
      wardCode: userAddress.wardCode,
      latitude: userAddress.latitude,
      longitude: userAddress.longitude,
      isDefault: userAddress.isDefault,
    };

    return userAddressReturn;
  });
};

const updateUserAddressService = async (data) => {
  const { addressId, updateData, userId } = data;

  return sequelize.transaction(async (t) => {
    const userAddress = await UserAddress.findByPk(addressId, {
      transaction: t,
    });

    if (!userAddress) {
      throw new NotFoundError("Địa chỉ không tồn tại");
    }

    // nếu set địa chỉ này thành default
    if (updateData.isDefault === true) {
      await UserAddress.update(
        { isDefault: false },
        {
          where: { userId },
          transaction: t,
        },
      );
    }

    const payload = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined),
    );

    await userAddress.update(payload, { transaction: t });

    const userAddressReturn = {
      id: userAddress.id,
      label: userAddress.label,
      fullName: userAddress.fullName,
      phoneNumber: userAddress.phoneNumber,
      address: userAddress.address,
      provinceCode: userAddress.provinceCode,
      districtCode: userAddress.districtCode,
      wardCode: userAddress.wardCode,
      provinceCode: userAddress.provinceCode,
      districtCode: userAddress.districtCode,
      wardCode: userAddress.wardCode,
      latitude: userAddress.latitude,
      longitude: userAddress.latitude,
      isDefault: userAddress.isDefault,
    };

    return userAddressReturn;
  });
};

const deleteUserAddressService = async (data) => {
  const { addressId, userId } = data;
  return sequelize.transaction(async (t) => {
    const address = await UserAddress.findOne({
      where: { id: addressId, userId },
      transaction: t,
    });

    if (!address) {
      throw new NotFoundError("Địa chỉ không tồn tại");
    }

    // Không cho xóa địa chỉ mặc định
    if (address.isDefault) {
      throw new BadRequestError(
        "Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.",
      );
    }

    await address.destroy({ transaction: t });
  });
};

const addressService = {
  getUserAddressService,
  addUserAddressService,
  updateUserAddressService,
  deleteUserAddressService,
};

export default addressService;
