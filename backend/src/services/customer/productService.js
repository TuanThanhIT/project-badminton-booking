import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Category,
  Product,
  ProductImage,
  ProductVarient,
} from "../../models/index.js";
import { col, fn, Op } from "sequelize";

// Đoạn code này hay vl
const getProductsByFilterService = async (
  cateId,
  prices,
  sizes,
  colors,
  materials,
  excludeProductId
) => {
  try {
    // 1. Kiểm tra danh mục có tồn tại hay không
    const category = await Category.findByPk(cateId);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tồn tại!");
    }

    // 2. Truy vấn sản phẩm + lấy giá thấp nhất (MIN) từ bảng biến thể
    const productsFilter = await Product.findAll({
      where: {
        categoryId: cateId,
        ...(excludeProductId && { id: { [Op.ne]: excludeProductId } }),
      },
      attributes: [
        "id",
        "productName",
        "brand",
        "thumbnailUrl",
        "createdDate",
        "categoryId",
        [fn("MIN", col("varients.price")), "minPrice"], // dùng hàm tổng hợp
      ],
      include: [
        {
          model: ProductVarient,
          as: "varients",
          attributes: [], // không lấy dữ liệu biến thể, chỉ JOIN để lọc
          where: {
            ...(prices?.length > 0 && {
              price: { [Op.between]: [prices[0], prices[1]] },
            }),
            ...(sizes?.length > 0 && { size: { [Op.in]: sizes } }),
            ...(colors?.length > 0 && { color: { [Op.in]: colors } }),
            ...(materials?.length > 0 && { material: { [Op.in]: materials } }),
          },
          required: true, // INNER JOIN (chỉ lấy sản phẩm có biến thể phù hợp)
        },
      ],
      group: ["Product.id"], // bắt buộc khi dùng hàm tổng hợp (MIN)
      raw: false,
      nest: true,
    });

    // 3. Xử lý song song từng sản phẩm (Promise.all để đợi tất cả xong)
    const productFormatted = await Promise.all(
      productsFilter.map(async (p) => {
        const minPrice = parseFloat(p.get("minPrice")); // 👉 lấy giá trị alias minPrice

        // ✅ 4. Truy vấn thêm để tìm discount ứng với minPrice
        const varient = await ProductVarient.findOne({
          where: {
            productId: p.id,
            price: minPrice,
          },
          attributes: ["discount"],
        });

        const discount = varient ? varient.discount : 0;
        const minDiscountedPrice = minPrice - (minPrice * discount) / 100; // 👉 tính giá sau giảm

        // Tính xem sản phẩm có mới hay không
        const created = new Date(p.get("createdDate"));
        const now = new Date();
        const diffTime = now.getTime() - created.getTime(); //getTime() trả về số mili-giây kể từ 1/1/1970 (Unix timestamp) của ngày đó.
        const diffDays = diffTime / (1000 * 60 * 60 * 24); // Chia số mili-giây cho (1000 * 60 * 60 * 24) để chuyển từ mili-giây sang số ngày.
        const isNew = diffDays <= 10;

        return {
          ...p.toJSON(), // 👉 chuyển về object thường
          discount,
          minDiscountedPrice,
          isNew,
        };
      })
    );

    return productFormatted;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getProductsByGroupNameAndFilterService = async (
  groupName,
  prices,
  sizes,
  colors,
  materials,
  excludeProductId
) => {
  try {
    // 1. Tìm tất cả các danh mục của group name
    const categories = await Category.findAll({
      where: { menuGroup: groupName },
    }); // thay findOne -> findAll

    // Lấy danh sách id của tất cả category
    const categoryIds = categories.map((cate) => cate.id);

    // 2. Truy vấn sản phẩm + lấy giá thấp nhất (MIN) từ bảng biến thể
    const productsFilter = await Product.findAll({
      where: {
        categoryId: { [Op.in]: categoryIds }, // dùng tất cả id category
        ...(excludeProductId && { id: { [Op.ne]: excludeProductId } }),
      },
      attributes: [
        "id",
        "productName",
        "brand",
        "thumbnailUrl",
        "createdDate",
        "categoryId",
        [fn("MIN", col("varients.price")), "minPrice"],
      ],
      include: [
        {
          model: ProductVarient,
          as: "varients",
          attributes: [],
          where: {
            ...(prices?.length > 0 && {
              price: { [Op.between]: [prices[0], prices[1]] },
            }),
            ...(sizes?.length > 0 && { size: { [Op.in]: sizes } }),
            ...(colors?.length > 0 && { color: { [Op.in]: colors } }),
            ...(materials?.length > 0 && { material: { [Op.in]: materials } }),
          },
          required: true,
        },
      ],
      group: ["Product.id"],
      raw: false,
      nest: true,
    });

    // 3. Xử lý song song từng sản phẩm
    const productFormatted = await Promise.all(
      productsFilter.map(async (p) => {
        const minPrice = parseFloat(p.get("minPrice"));

        const varient = await ProductVarient.findOne({
          where: {
            productId: p.id,
            price: minPrice,
          },
          attributes: ["discount"],
        });

        const discount = varient ? varient.discount : 0;
        const minDiscountedPrice = minPrice - (minPrice * discount) / 100;

        const created = new Date(p.get("createdDate"));
        const now = new Date();
        const diffDays =
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        const isNew = diffDays <= 10;

        return {
          ...p.toJSON(),
          discount,
          minDiscountedPrice,
          isNew,
        };
      })
    );

    return productFormatted;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getProductDetailService = async (productId) => {
  try {
    const product = await Product.findByPk(productId, {
      attributes: ["id", "productName", "brand", "description"],
      include: [
        {
          model: ProductVarient,
          as: "varients",
        },
        {
          model: ProductImage,
          as: "images",
        },
      ],
    });

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tạo!");
    }

    const varientsWithDiscount = product.varients.map((v) => {
      const discountPrice = v.price - (v.price * v.discount) / 100;
      return {
        ...v.toJSON(),
        discountPrice,
      };
    });

    const productDetail = {
      ...product.toJSON(),
      varients: varientsWithDiscount, // dùng mảng mới đã tính discountPrice
    };

    return productDetail;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const productCustomerService = {
  getProductsByFilterService,
  getProductDetailService,
  getProductsByGroupNameAndFilterService,
};
export default productCustomerService;
