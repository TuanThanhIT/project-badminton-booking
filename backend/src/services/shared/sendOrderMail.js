import mailer from "../../helpers/mailer.js";

export const handleSendOrderMail = (order, type) => {
  const orderProducts = order.orderDetails.map((item) => {
    return {
      productName: item.varient.product.productName,
      color: item.varient.color,
      size: item.varient.size,
      material: item.varient.material,
      quantity: item.quantity,
      subTotal: item.subTotal,
    };
  });

  const totalAmount = order.totalAmount;
  const email = order.user.email;

  return mailer.sendOrderMail(email, orderProducts, totalAmount, type);
};
