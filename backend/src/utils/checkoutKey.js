import NotFoundError from "../errors/NotFoundError.js";

export const getCheckoutKey = ({ userId, cartId }) => {
  if (!userId || !cartId) {
    throw new NotFoundError("Invalid checkout key params");
  }

  return `ecom:checkout:v1:${userId}:${cartId}`;
};
