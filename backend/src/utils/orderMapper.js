import { ORDER_STATUS, SHIPPING_STATUS } from "../constants/orderConstant.js";

export const syncOrderStatus = (shippingStatus) => {
  switch (shippingStatus) {
    case SHIPPING_STATUS.CREATED:
    case SHIPPING_STATUS.PENDING:
    case SHIPPING_STATUS.PICKED:
    case SHIPPING_STATUS.IN_TRANSIT:
    case SHIPPING_STATUS.DELIVERING:
      return ORDER_STATUS.SHIPPING;

    case SHIPPING_STATUS.DELIVERED:
      return ORDER_STATUS.COMPLETED;

    case SHIPPING_STATUS.FAILED:
    case SHIPPING_STATUS.RETURNED:
      return ORDER_STATUS.FAILED;

    case SHIPPING_STATUS.CANCELLED:
      return ORDER_STATUS.CANCELLED;

    default:
      return null;
  }
};
