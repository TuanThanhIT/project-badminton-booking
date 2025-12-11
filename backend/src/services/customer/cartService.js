import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Cart,
  CartItem,
  Product,
  ProductVarient,
  User,
} from "../../models/index.js";
import sequelize from "../../config/db.js";

const addItemToCartService = async (userId, quantity, varientId) => {
  const t = await sequelize.transaction();
  try {
    const q = Number(quantity);
    const vaId = Number(varientId);
    if (q < 1)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Số lượng không hợp lệ!");

    const [user, varient] = await Promise.all([
      User.findByPk(userId, { transaction: t }),
      ProductVarient.findOne({
        where: { id: vaId },
        include: {
          model: Product,
          as: "product",
          attributes: ["productName", "thumbnailUrl"],
        },
        transaction: t,
      }),
    ]);

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại!");
    if (!varient)
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");

    const cart = await Cart.findOrCreate({
      where: { userId },
      transaction: t,
    }).then(([c]) => c);

    const price = varient.price * (1 - (varient.discount || 0) / 100);
    if (isNaN(price))
      throw new ApiError(StatusCodes.BAD_REQUEST, "Giá sản phẩm không hợp lệ!");

    const [cartItem, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, varientId: vaId },
      defaults: { quantity: q, subTotal: price * q },
      transaction: t,
    });

    if (!created) {
      cartItem.quantity += q;
      cartItem.subTotal = price * cartItem.quantity;
      await cartItem.save({ transaction: t });
    }

    await t.commit();

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
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || "Lỗi không xác định!"
    );
  }
};

const getCartItemService = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại!");

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
      0
    );

    const cartObj = cart.get({ plain: true });
    cartObj.cartItems = updatedCartItems;
    cartObj.totalAmount = totalAmount;

    await cart.update({ totalAmount });

    return cartObj;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateQuantityService = async (cartItemId, quantity) => {
  const t = await sequelize.transaction();
  try {
    const cartItem = await CartItem.findByPk(cartItemId, { transaction: t });
    if (!cartItem) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Sản phẩm không tồn tại trong giỏ hàng!"
      );
    }

    const varient = await ProductVarient.findByPk(cartItem.varientId, {
      transaction: t,
    });
    if (!varient) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");
    }

    if (quantity < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Số lượng không hợp lệ!");
    }

    if (quantity > varient.stock) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Số lượng vượt quá số lượng tồn kho! (Còn lại: ${varient.stock})`
      );
    }

    cartItem.quantity = quantity;
    cartItem.subTotal =
      (varient.price - (varient.price * varient.discount) / 100) * quantity;

    await cartItem.save({ transaction: t });

    await t.commit();
    return cartItem;
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteCartItemService = async (cartItemId) => {
  try {
    const cartItem = await CartItem.findByPk(cartItemId);
    if (!cartItem) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Sản phẩm không tồn tại trong giỏ hàng!"
      );
    }
    return await cartItem.destroy();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteAllCartItemService = async (userId) => {
  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Giỏ hàng không tồn tại!");
    }
    return await CartItem.destroy({ where: { cartId: cart.id } });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const cartService = {
  addItemToCartService,
  getCartItemService,
  updateQuantityService,
  deleteCartItemService,
  deleteAllCartItemService,
};

export default cartService;
