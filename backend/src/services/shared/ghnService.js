import axios from "axios";
import dotenv from "dotenv";
import {
  Branch,
  OrderDetail,
  OrderGroup,
  Payment,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  PAYMENT_METHOD_STATUS,
  TARGET_PAYMENT_TYPE,
} from "../../constants/paymentConstant.js";

dotenv.config();

export const getAvailableServices = async ({
  fromDistrictId,
  toDistrictId,
  ghnShopId,
}) => {
  const res = await axios.post(
    `${process.env.GHN_BASE_URL}/v2/shipping-order/available-services`,
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
    `${process.env.GHN_BASE_URL}/v2/shipping-order/leadtime`,
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
    throw new NotFoundError("Cửa hàng không tồn tại");
  }

  const orderGroup = await OrderGroup.findByPk(order.orderGroupId);
  if (!orderGroup) {
    throw new NotFoundError("Đơn hàng không tồn tại");
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
    quantity: i.quantity,
    price: i.unitPrice,
    weight: 200,
    length: 20,
    width: 20,
    height: 20,
  }));

  const isCOD = payment.paymentMethod === PAYMENT_METHOD_STATUS.COD;

  const res = await axios.post(
    `${process.env.GHN_BASE_URL}/v2/shipping-order/create`,
    {
      payment_type_id: isCOD ? 2 : 1,

      cod_amount: isCOD ? Number(order.totalAmount) : 0,

      required_note: "KHONGCHOXEMHANG",
      content: `Order #${order.id}`, // 🔥 thêm cái này

      from_name: branch.branchName,
      from_phone: branch.phoneNumber,
      from_address: branch.address,
      from_district_id: branch.districtId,
      from_ward_code: branch.wardCode,

      to_name: order.shippingName,
      to_phone: order.shippingPhone,
      to_address: order.shippingAddress,
      to_district_id: Number(order.shippingDistrictId),
      to_ward_code: String(order.shippingWardCode),

      weight,
      length: 20,
      width: 20,
      height: 20,

      service_type_id: 2,
      items,
    },
    {
      headers: {
        Token: process.env.GHN_TOKEN_DEV,
        ShopId: branch.ghnShopId,
      },
    },
  );

  return res.data.data;
};
