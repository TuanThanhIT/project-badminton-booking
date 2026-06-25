import axios from "axios";
import dotenv from "dotenv";
import {
  Branch,
  OrderDetail,
  OrderGroup,
  Payment,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import InternalServerError from "../../errors/InternalServerError.js";
import {
  PAYMENT_METHOD_STATUS,
  TARGET_PAYMENT_TYPE,
} from "../../constants/paymentConstant.js";

dotenv.config();

const GHN_BASE_URL =
  process.env.GHN_BASE_URL ||
  "https://dev-online-gateway.ghn.vn/shiip/public-api";

const ghnClient = axios.create({
  baseURL: GHN_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

ghnClient.interceptors.request.use((config) => {
  const token = process.env.GHN_TOKEN_DEV;
  if (token) {
    config.headers.Token = token;
  }
  return config;
});

const ensureGhnToken = () => {
  if (!process.env.GHN_TOKEN_DEV) {
    throw new InternalServerError("Chưa cấu hình token GHN");
  }
};

const ensureGhnDataArray = (response, label) => {
  const data = response.data?.data;

  if (!Array.isArray(data)) {
    throw new InternalServerError(`Phản hồi GHN ${label} không hợp lệ`);
  }

  return data;
};

const throwGhnMasterDataError = (error, label) => {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  if (error.code === "ECONNABORTED") {
    throw new InternalServerError(`Yêu cầu GHN ${label} đã quá thời gian chờ`);
  }

  if (!error.response) {
    throw new InternalServerError(`Không thể kết nối dịch vụ GHN ${label}`);
  }

  throw new BadRequestError(`GHN báo lỗi: ${getGhnErrorMessage(error)}`, {
    status: error.response.status,
    service: label,
  });
};

const getGhnErrorMessage = (error) => {
  const responseData = error.response?.data;

  return (
    responseData?.message ||
    responseData?.code_message ||
    responseData?.data?.message ||
    error.message ||
    "GHN từ chối yêu cầu vận chuyển"
  );
};

const toPositiveInteger = (value, fieldName) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new BadRequestError(`${fieldName} không hợp lệ`);
  }

  return numberValue;
};

export const getGhnProvinces = async () => {
  ensureGhnToken();

  try {
    const response = await ghnClient.get("/master-data/province");
    return ensureGhnDataArray(response, "province");
  } catch (error) {
    throwGhnMasterDataError(error, "province");
  }
};

export const getGhnDistricts = async (provinceId) => {
  ensureGhnToken();
  const normalizedProvinceId = toPositiveInteger(provinceId, "provinceId");

  try {
    const response = await ghnClient.post("/master-data/district", {
      province_id: normalizedProvinceId,
    });
    return ensureGhnDataArray(response, "district");
  } catch (error) {
    throwGhnMasterDataError(error, "district");
  }
};

export const getGhnWards = async (districtId) => {
  ensureGhnToken();
  const normalizedDistrictId = toPositiveInteger(districtId, "districtId");

  try {
    const response = await ghnClient.get("/master-data/ward", {
      params: {
        district_id: normalizedDistrictId,
      },
    });
    return ensureGhnDataArray(response, "ward");
  } catch (error) {
    throwGhnMasterDataError(error, "ward");
  }
};

const throwGhnRequestError = (error, context = {}) => {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  throw new BadRequestError(`GHN báo lỗi: ${getGhnErrorMessage(error)}`, {
    status: error.response?.status || null,
    ghn: error.response?.data || null,
    context,
  });
};

export const getAvailableServices = async ({
  fromDistrictId,
  toDistrictId,
  ghnShopId,
}) => {
  const res = await axios.post(
    `${GHN_BASE_URL}/v2/shipping-order/available-services`,
    {
      from_district: fromDistrictId,
      to_district: toDistrictId,
      shop_id: ghnShopId,
    },
    {
      headers: {
        Token: process.env.GHN_TOKEN_DEV,
      },
    },
  );

  return res.data?.data || [];
};

export const getLeadtimeService = async ({
  fromDistrictId,
  fromWardCode,
  toDistrictId,
  toWardCode,
  serviceId,
  ghnShopId,
}) => {
  const res = await axios.post(
    `${GHN_BASE_URL}/v2/shipping-order/leadtime`,
    {
      from_district_id: fromDistrictId,
      from_ward_code: fromWardCode,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      service_id: serviceId,
    },
    {
      headers: {
        Token: process.env.GHN_TOKEN_DEV,
        ShopId: ghnShopId,
      },
    },
  );

  const data = res.data?.data;

  return {
    leadtime: data?.leadtime,
    fromDate: data?.leadtime_order?.from_estimate_date,
    toDate: data?.leadtime_order?.to_estimate_date,
  };
};

export const createGHNOrderService = async (order) => {
  const branch = await Branch.findByPk(order.branchId);
  if (!branch) {
    throw new NotFoundError("Không tìm thấy chi nhánh");
  }

  if (!process.env.GHN_TOKEN_DEV) {
    throw new BadRequestError("Chưa cấu hình token GHN");
  }

  if (!branch.ghnShopId) {
    throw new BadRequestError("Chi nhánh chưa cấu hình mã cửa hàng GHN");
  }

  if (!branch.districtId || !branch.wardCode) {
    throw new BadRequestError("Địa chỉ GHN của chi nhánh chưa đầy đủ");
  }

  if (!order.shippingDistrictId || !order.shippingWardCode) {
    throw new BadRequestError("Địa chỉ GHN nhận hàng chưa đầy đủ");
  }

  const orderGroup = await OrderGroup.findByPk(order.orderGroupId);
  if (!orderGroup) {
    throw new NotFoundError("Không tìm thấy nhóm đơn hàng");
  }

  const payment = await Payment.findOne({
    where: {
      targetPaymentId: orderGroup.id,
      targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
    },
  });

  const itemsDb = await OrderDetail.findAll({
    where: { orderId: order.id },
  });

  const weight = Math.max(
    100,
    Math.ceil(Number(order.shippingWeight || 0) * 1000),
  );

  const items = itemsDb.map((i) => ({
    name: i.productName,
    code: String(i.variantId),
    quantity: Number(i.quantity),
    price: Number(i.unitPrice),
    weight: 200,
    length: 20,
    width: 20,
    height: 20,
  }));

  const isCOD = payment?.paymentMethod === PAYMENT_METHOD_STATUS.COD;
  const shippingServiceId = Number(order.shippingServiceId || 0);

  if (!shippingServiceId) {
    throw new BadRequestError("Đơn hàng chưa chọn dịch vụ vận chuyển GHN");
  }

  const payload = {
    payment_type_id: isCOD ? 2 : 1,
    cod_amount: isCOD ? Number(order.totalAmount) : 0,
    required_note: "KHONGCHOXEMHANG",
    content: `Order #${order.id}`,

    from_name: branch.branchName,
    from_phone: branch.phoneNumber,
    from_address: branch.address,
    from_district_id: Number(branch.districtId),
    from_ward_code: String(branch.wardCode),

    to_name: order.shippingName,
    to_phone: order.shippingPhone,
    to_address: order.shippingAddress,
    to_district_id: Number(order.shippingDistrictId),
    to_ward_code: String(order.shippingWardCode),

    weight,
    length: 20,
    width: 20,
    height: 20,

    service_id: shippingServiceId,
    items,
  };

  try {
    const res = await axios.post(
      `${GHN_BASE_URL}/v2/shipping-order/create`,
      payload,
      {
        headers: {
          Token: process.env.GHN_TOKEN_DEV,
          ShopId: branch.ghnShopId,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data.data;
  } catch (error) {
    throwGhnRequestError(error, {
      orderId: order.id,
      branchId: branch.id,
      shopId: branch.ghnShopId,
      serviceId: shippingServiceId,
      fromDistrictId: Number(branch.districtId),
      fromWardCode: String(branch.wardCode),
      toDistrictId: Number(order.shippingDistrictId),
      toWardCode: String(order.shippingWardCode),
      weight,
    });
  }
};

export const cancelGHNOrder = async ({ orderCode, shopId }) => {
  const res = await axios.post(
    `${GHN_BASE_URL}/v2/switch-status/cancel`,
    {
      order_codes: [orderCode],
    },
    {
      headers: {
        Token: process.env.GHN_TOKEN_DEV,
        ShopId: shopId,
        "Content-Type": "application/json",
      },
    },
  );

  const result = res.data?.data?.[0];

  if (!result?.result) {
    throw new BadRequestError(
      result?.message || "GHN không cho phép hủy đơn hàng này",
    );
  }

  return result;
};

export const returnGHNOrder = async ({ orderCode, shopId }) => {
  const res = await axios.post(
    `${GHN_BASE_URL}/v2/switch-status/return`,
    {
      order_codes: [orderCode],
    },
    {
      headers: {
        Token: process.env.GHN_TOKEN_DEV,
        ShopId: shopId,
        "Content-Type": "application/json",
      },
    },
  );

  const result = res.data?.data?.[0];

  if (!result?.result) {
    throw new BadRequestError(
      result?.message || "GHN không cho phép hoàn đơn hàng này",
    );
  }

  return result;
};
