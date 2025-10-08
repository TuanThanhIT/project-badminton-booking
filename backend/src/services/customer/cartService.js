import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Cart,
  CartItem,
  Product,
  ProductVarient,
  User,
} from "../../models/index.js";

const addItemToCartService = async (userId, quantity, varientId) => {
  try {
    const q = Number(quantity);
    const vaId = Number(varientId);
    if (q < 1)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Số lượng không hợp lệ!");

    // Lấy user & varient (kèm product trong 1 lần truy vấn)
    const [user, varient] = await Promise.all([
      User.findByPk(userId),
      ProductVarient.findOne({
        where: { id: vaId },
        include: {
          model: Product,
          as: "product",
          attributes: ["productName", "thumbnailUrl"],
        },
      }),
    ]);

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại!");
    if (!varient)
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");

    // Tạo cart nếu chưa có
    const cart = await Cart.findOrCreate({ where: { userId } }).then(
      ([c]) => c
    );

    // Tính giá thực tế
    const price = varient.price * (1 - (varient.discount || 0) / 100);
    if (isNaN(price))
      throw new ApiError(StatusCodes.BAD_REQUEST, "Giá sản phẩm không hợp lệ!");

    // Cập nhật hoặc thêm mới cartItem
    const [cartItem, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, varientId: vaId },
      defaults: { quantity: q, subTotal: price * q },
    });

    if (!created) {
      cartItem.quantity += q;
      cartItem.subTotal = price * cartItem.quantity;
      await cartItem.save();
    }

    // Chuẩn hóa response
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

    // Lấy hoặc tạo cart, chỉ lấy những thuộc tính cần
    let cart = await Cart.findOne({
      where: { userId },
      attributes: ["id", "totalAmount"],
    });
    if (!cart) {
      cart = await Cart.create({ userId });
      await cart.reload({ attributes: ["id", "totalAmount"] });
    }

    // Lấy cartItems kèm thông tin variant + product
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: ProductVarient,
          as: "varient",
          attributes: ["id", "price", "discount", "stock"],
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

    // Convert sang plain object và tính giá sau discount
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
        price,
      };
    });

    // Tính tổng tiền
    const totalAmount = updatedCartItems.reduce(
      (sum, item) => sum + item.subTotal,
      0
    );

    // Convert cart thành plain object và gắn cartItems + totalAmount
    const cartObj = cart.get({ plain: true });
    cartObj.cartItems = updatedCartItems;
    cartObj.totalAmount = totalAmount;

    // Lưu tổng tiền vào DB
    await cart.update({ totalAmount });

    return cartObj;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateQuantityService = async (cartItemId, quantity) => {
  try {
    const cartItem = await CartItem.findByPk(cartItemId);
    if (!cartItem) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Sản phẩm không tồn tại trong giỏ hàng!"
      );
    }
    const varient = await ProductVarient.findByPk(cartItem.varientId);
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
    cartItem.save();
    return cartItem;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
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
    const item = await cartItem.destroy();
    return item;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteAllCartItemService = async (userId) => {
  try {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Giỏ hàng không tồn tại!");
    }
    const deleteCount = await CartItem.destroy({ where: { cartId: cart.id } });
    return deleteCount;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
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
