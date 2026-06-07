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
import {
  PAYMENT_METHOD_STATUS,
  TARGET_PAYMENT_TYPE,
} from "../../constants/paymentConstant.js";

dotenv.config();

const GHN_BASE_URL =
  process.env.GHN_BASE_URL ||
  "https://dev-online-gateway.ghn.vn/shiip/public-api";

const getGhnErrorMessage = (error) => {
  const responseData = error.response?.data;

  return (
    responseData?.message ||
    responseData?.code_message ||
    responseData?.data?.message ||
    error.message ||
    "GHN rejected the shipping request"
  );
};

const throwGhnRequestError = (error, context = {}) => {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  throw new BadRequestError(`GHN: ${getGhnErrorMessage(error)}`, {
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
    throw new NotFoundError("Branch not found");
  }

  if (!process.env.GHN_TOKEN_DEV) {
    throw new BadRequestError("GHN token is not configured");
  }

  if (!branch.ghnShopId) {
    throw new BadRequestError("Branch has no GHN shop ID configured");
  }

  if (!branch.districtId || !branch.wardCode) {
    throw new BadRequestError("Branch GHN address is incomplete");
  }

  if (!order.shippingDistrictId || !order.shippingWardCode) {
    throw new BadRequestError("Shipping GHN address is incomplete");
  }

  const orderGroup = await OrderGroup.findByPk(order.orderGroupId);
  if (!orderGroup) {
    throw new NotFoundError("Order group not found");
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
    throw new BadRequestError("Order has no GHN shipping service selected");
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
      result?.message || "GHN does not allow cancelling this order",
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
      result?.message || "GHN does not allow returning this order",
    );
  }

  return result;
};
