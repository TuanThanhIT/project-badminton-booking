import {
  Cart,
  CartItem,
  Product,
  ProductVarient,
  User,
} from "../../models/index.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";

const addItemToCartService = async (data) => {
  const { userId, quantity, varientId } = data;
  return sequelize.transaction(async (t) => {
    const [user, varient] = await Promise.all([
      User.findByPk(userId, { transaction: t }),
      ProductVarient.findOne({
        where: { id: varientId },
        include: {
          model: Product,
          as: "product",
          attributes: ["productName", "thumbnailUrl"],
        },
        transaction: t,
      }),
    ]);

    if (!user) throw new NotFoundError("User không tồn tại");
    if (!varient) throw new NotFoundError("Sản phẩm không tồn tại");
    if (quantity > varient.stock) {
      throw new BadRequestError(
        `Số lượng vượt quá tồn kho (Còn lại: ${varient.stock})`,
      );
    }

    const cart = await Cart.findOrCreate({
      where: { userId },
      transaction: t,
    }).then(([c]) => c);

    const price = varient.price * (1 - (varient.discount || 0) / 100);
    if (isNaN(price)) throw new BadRequestError("Giá sản phẩm không hợp lệ");

    const [cartItem, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, varientId },
      defaults: { quantity, subTotal: price * quantity },
      transaction: t,
    });

    if (!created) {
      cartItem.quantity += quantity;
      cartItem.subTotal = price * cartItem.quantity;
      await cartItem.save({ transaction: t });
    }

    return {
      id: cartItem.id,
      quantity: cartItem.quantity,
      subTotal: cartItem.subTotal,
      productName: varient.product.productName,
      thumbnailUrl: varient.product.thumbnailUrl,
      varientId,
      stock: varient.stock,
      price,
    };
  });
};

const getCartItemsService = async (data) => {
  const { userId } = data;
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User không tồn tại");
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
        model: ProductVarient,
        as: "varient",
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
        ? obj.varient.price * (1 - (obj.varient.discount || 0) / 100)
        : 0;
    return {
      id: obj.id,
      quantity: obj.quantity,
      subTotal: obj.subTotal,
      productName: obj.varient.product.productName,
      thumbnailUrl: obj.varient.product.thumbnailUrl,
      varientId: obj.varient.id,
      stock: obj.varient.stock,
      color: obj.varient.color,
      size: obj.varient.size,
      material: obj.varient.material,
      price,
    };
  });

  const totalAmount = updatedCartItems.reduce(
    (sum, item) => sum + item.subTotal,
    0,
  );

  const cartObj = cart.get({ plain: true });
  cartObj.cartItems = updatedCartItems;
  cartObj.totalAmount = totalAmount;

  await cart.update({ totalAmount });

  return cartObj;
};

const updateQuantityService = async (data) => {
  const { cartItemId, quantity } = data;
  return sequelize.transaction(async (t) => {
    const cartItem = await CartItem.findByPk(cartItemId, { transaction: t });
    if (!cartItem) {
      throw new NotFoundError("Sản phẩm không tồn tại trong giỏ hàng");
    }

    const varient = await ProductVarient.findByPk(cartItem.varientId, {
      transaction: t,
    });
    if (!varient) {
      throw new NotFoundError("Sản phẩm không tồn tại");
    }

    if (quantity > varient.stock) {
      throw new BadRequestError(
        `Số lượng vượt quá số lượng tồn kho! (Còn lại: ${varient.stock})`,
      );
    }

    cartItem.quantity = quantity;
    cartItem.subTotal =
      (varient.price - (varient.price * varient.discount) / 100) * quantity;

    await cartItem.save({ transaction: t });
    return cartItem;
  });
};

const deleteCartItemService = async (data) => {
  const { cartItemId } = data;

  const cartItem = await CartItem.findByPk(cartItemId);
  if (!cartItem) {
    throw new NotFoundError("Sản phẩm không tồn tại trong giỏ hàng");
  }
  return await cartItem.destroy();
};

const deleteAllCartItemService = async (data) => {
  const { userId } = data;
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    throw new NotFoundError("Giỏ hàng không tồn tại");
  }
  return await CartItem.destroy({ where: { cartId: cart.id } });
};

const cartService = {
  addItemToCartService,
  getCartItemsService,
  updateQuantityService,
  deleteCartItemService,
  deleteAllCartItemService,
};

export default cartService;
