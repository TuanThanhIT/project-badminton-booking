import {
  Cart,
  CartItem,
  Product,
  ProductVariant,
  User,
} from "../../models/index.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";

const recalcCartTotal = async (cartId, transaction) => {
  const cartItems = await CartItem.findAll({
    where: { cartId },
    attributes: ["quantity", "subTotal"],
    transaction,
  });

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.subTotal),
    0,
  );

  await Cart.update({ totalAmount }, { where: { id: cartId }, transaction });

  return totalAmount;
};

const addItemToCartService = async (data) => {
  const { userId, quantity, variantId } = data;
  return sequelize.transaction(async (t) => {
    const [user, variant] = await Promise.all([
      User.findByPk(userId, { transaction: t }),
      ProductVariant.findOne({
        where: { id: variantId },
        include: {
          model: Product,
          as: "product",
          attributes: ["productName", "thumbnailUrl"],
        },
        transaction: t,
      }),
    ]);
    if (!user) throw new NotFoundError("User không tồn tại");
    if (!variant) throw new NotFoundError("Sản phẩm không tồn tại");
    if (quantity > variant.stock) {
      throw new BadRequestError(
        `Số lượng vượt quá tồn kho (Còn lại: ${variant.stock})`,
      );
    }
    const cart = await Cart.findOrCreate({
      where: { userId },
      transaction: t,
    }).then(([c]) => c);
    const price = variant.price * (1 - (variant.discount || 0) / 100);
    if (isNaN(price)) throw new BadRequestError("Giá sản phẩm không hợp lệ");
    const [cartItem, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, variantId },
      defaults: { quantity, subTotal: price * quantity },
      transaction: t,
    });
    if (!created) {
      cartItem.quantity += Number(quantity);
      cartItem.subTotal = price * cartItem.quantity;
      await cartItem.save({ transaction: t });
    }
    await recalcCartTotal(cart.id, t);
    return {
      id: cartItem.id,
      quantity: cartItem.quantity,
      subTotal: cartItem.subTotal,
      productName: variant.product.productName,
      thumbnailUrl: variant.product.thumbnailUrl,
      variantId,
      stock: variant.stock,
      size: variant.size,
      color: variant.color,
      material: variant.material,
      price,
    };
  });
};

const getCartItemsService = async (data) => {
  const { userId } = data;
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }
  let cart = await Cart.findOne({
    where: { userId },
    attributes: ["id", "totalAmount"],
  });
  if (!cart) {
    cart = await Cart.create({ userId });
    await cart.reload({ attributes: ["id", "totalAmount"] });
  }
  const cartItems = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: [
          "id",
          "price",
          "discount",
          "stock",
          "color",
          "size",
          "material",
        ],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "productName", "thumbnailUrl"],
          },
        ],
      },
    ],
  });
  const updatedCartItems = cartItems.map((item) => {
    const obj = item.get({ plain: true });
    const price =
      obj.quantity > 0
        ? obj.variant.price * (1 - (obj.variant.discount || 0) / 100)
        : 0;
    return {
      id: obj.id,
      quantity: obj.quantity,
      subTotal: obj.subTotal,
      productName: obj.variant.product.productName,
      thumbnailUrl: obj.variant.product.thumbnailUrl,
      variantId: obj.variant.id,
      stock: obj.variant.stock,
      color: obj.variant.color,
      size: obj.variant.size,
      material: obj.variant.material,
      price,
    };
  });

  const cartObj = cart.get({ plain: true });
  cartObj.cartItems = updatedCartItems;
  cartObj.totalAmount = cart.totalAmount;
  return cartObj;
};

const updateQuantityService = async (data) => {
  const { cartItemId, quantity } = data;
  return sequelize.transaction(async (t) => {
    const cartItem = await CartItem.findByPk(cartItemId, { transaction: t });
    if (!cartItem) {
      throw new NotFoundError("Sản phẩm không tồn tại trong giỏ hàng");
    }
    const variant = await ProductVariant.findByPk(cartItem.variantId, {
      transaction: t,
    });
    if (!variant) {
      throw new NotFoundError("Sản phẩm không tồn tại");
    }
    if (quantity > variant.stock) {
      throw new BadRequestError(
        `Số lượng vượt quá số lượng tồn kho! (Còn lại: ${variant.stock})`,
      );
    }
    cartItem.quantity = Number(quantity);
    cartItem.subTotal =
      (variant.price - (variant.price * variant.discount) / 100) * quantity;

    await cartItem.save({ transaction: t });
    await recalcCartTotal(cartItem.cartId, t);
    return cartItem;
  });
};

const deleteCartItemService = async (data) => {
  const { cartItemId } = data;
  return sequelize.transaction(async (t) => {
    const cartItem = await CartItem.findByPk(cartItemId);
    if (!cartItem) {
      throw new NotFoundError("Sản phẩm không tồn tại trong giỏ hàng");
    }
    await cartItem.destroy();
    await recalcCartTotal(cartItem.cartId, t);
  });
};

const deleteAllCartItemService = async (data) => {
  const { userId } = data;
  return sequelize.transaction(async (t) => {
    const cart = await Cart.findOne({ where: { userId }, transaction: t });
    if (!cart) {
      throw new NotFoundError("Giỏ hàng không tồn tại");
    }
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
    await recalcCartTotal(cart.id, t);
  });
};

const cartService = {
  addItemToCartService,
  getCartItemsService,
  updateQuantityService,
  deleteCartItemService,
  deleteAllCartItemService,
};

export default cartService;
