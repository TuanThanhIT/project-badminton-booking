import axios from "axios";
import dotenv from "dotenv";
import sequelize from "../../config/db.js";
import { redisClient } from "../../config/redis.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  Branch,
  Cart,
  CartItem,
  ProductVariant,
  UserAddress,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";

dotenv.config();

const checkoutPreviewService = async (data) => {
  const { cartId, addressId, userId } = data;
  return sequelize.transaction(async (t) => {
    const cart = await Cart.findByPk(
      cartId,
      {
        include: [
          {
            model: CartItem,
            as: "items",
            include: [
              {
                model: ProductVariant,
                as: "variant",
              },
            ],
          },
        ],
      },
      { transaction: t },
    );
    if (!cart) throw new NotFoundError("Giỏ hàng không tồn tại");
    const address = await UserAddress.findByPk(addressId, { transaction: t });
    if (!address) throw new NotFoundError("Địa chỉ không tồn tại");
    const subTotal = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.variant.price;
    });
    const groups = {};
    for (const item of cart.items) {
      const branchId = item.variant.branchId;

      if (!groups[branchId]) {
        groups[branchId] = {
          branchId,
          items: [],
          weight: 0,
        };

        groups[branchId].items.push(item);
        groups[branchId].weight += item.quantity * item.variant.weight;
      }
    }
    const session = {
      cartId,
      address,
      subTotal,
      groups: Object.values(groups),
      shippingFeeTotal: 0,
      discount: {
        code: null,
        amount: 0,
      },
      total: subTotal,
    };
    await redisClient.set(`checkout:${userId}`, JSON.stringify(session), {
      EX: 1800,
    });
    return session;
  });
};

export const calculateShippingService = async ({ serviceTypeId, userId }) => {
  const raw = await redisClient.get(`checkout:${userId}`);
  if (!raw) {
    throw new BadRequestError("Checkout session hết hạn");
  }
  const session = JSON.parse(raw);
  let totalShipping = 0;
  for (const group of session.groups) {
    const branch = await Branch.findByPk(group.branchId);
    if (!branch) {
      throw new NotFoundError("Cửa hàng không tồn tại");
    }
    const ghnRes = await axios.post(
      "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
      {
        service_type_id: serviceTypeId || 2,
        from_district_id: branch.districtId,
        to_district_id: session.address.districtId,
        to_ward_code: session.address.wardCode,
        weight: Math.ceil(group.weight * 1000),
        length: 20,
        width: 20,
        height: 10,
        insurance_value: 0,
      },
      {
        headers: {
          Token: process.env.GHN_TOKEN,
          ShopId: process.env.GHN_SHOP_ID,
        },
      },
    );
    const fee = ghnRes.data.data.total;
    group.shippingFee = fee;
    totalShipping += fee;
  }
  session.shippingFeeTotal = totalShipping;
  session.total =
    session.subTotal + totalShipping - (session.discount?.amount || 0);
  await redisClient.set(`checkout:${userId}`, JSON.stringify(session), {
    EX: 1800,
  });

  return session;
};

const orderService = {
  checkoutPreviewService,
  calculateShippingService,
};

export default orderService;
