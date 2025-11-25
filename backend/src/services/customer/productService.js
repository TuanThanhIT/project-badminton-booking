import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Category,
  Product,
  ProductImage,
  ProductVarient,
} from "../../models/index.js";
import { col, fn, literal, Op } from "sequelize";

const SORT_OPTIONS = {
  price_asc: [[literal("minPrice"), "ASC"]],
  price_desc: [[literal("minPrice"), "DESC"]],
  newest: [["createdDate", "DESC"]],
  oldest: [["createdDate", "ASC"]],
};

const getSortOption = (sort) => {
  return SORT_OPTIONS[sort] || []; // không có thì không sort
};

// Đoạn code này hay vl
const getProductsByFilterService = async (
  cateId,
  prices,
  sizes,
  colors,
  materials,
  excludeProductId,
  sort,
  page,
  limit,
  keyword // thêm tham số
) => {
  try {
    const p = page && page !== "null" ? parseInt(page) : 1;
    const l = limit && limit !== "null" ? parseInt(limit) : 10;
    const offset = (p - 1) * l;

    const category = await Category.findByPk(cateId);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tồn tại!");
    }

    // Xử lý keyword
    const kw = keyword && keyword !== "null" ? keyword : undefined;

    const whereCondition = {
      categoryId: cateId,
      ...(excludeProductId && { id: { [Op.ne]: excludeProductId } }),
      ...(kw && { productName: { [Op.like]: `%${kw}%` } }),
    };

    const productIdsPage = await Product.findAll({
      where: whereCondition,
      attributes: ["id"],
      limit: l,
      offset,
      raw: true,
    });

    const ids = productIdsPage.map((p) => p.id);
    if (ids.length === 0) {
      return { products: [], total: 0, page: p, limit: l };
    }

    const total = await Product.count({ where: whereCondition });

    const productsFilter = await Product.findAll({
      where: { id: { [Op.in]: ids } },
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
        {
          model: Category,
          as: "category",
          attributes: ["id", "cateName"],
        },
      ],
      group: ["Product.id"],
      order: getSortOption(sort),
      raw: false,
      nest: true,
    });

    const productFormatted = await Promise.all(
      productsFilter.map(async (p) => {
        const minPrice = parseFloat(p.get("minPrice"));
        const varient = await ProductVarient.findOne({
          where: { productId: p.id, price: minPrice },
          attributes: ["discount"],
        });
        const discount = varient ? varient.discount : 0;
        const minDiscountedPrice = minPrice - (minPrice * discount) / 100;

        const created = new Date(p.get("createdDate"));
        const now = new Date();
        const diffDays =
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        const isNew = diffDays <= 10;

        return { ...p.toJSON(), discount, minDiscountedPrice, isNew };
      })
    );

    return { products: productFormatted, total, page: p, limit: l };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getProductsByGroupNameAndFilterService = async (
  groupName,
  prices,
  sizes,
  colors,
  materials,
  excludeProductId,
  sort,
  page,
  limit,
  keyword // thêm tham số
) => {
  try {
    const p = page && page !== "null" ? parseInt(page) : 1;
    const l = limit && limit !== "null" ? parseInt(limit) : 10;
    const offset = (p - 1) * l;

    const categories = await Category.findAll({
      where: { menuGroup: groupName },
    });
    const categoryIds = categories.map((c) => c.id);

    if (categoryIds.length === 0) {
      return { products: [], total: 0, page: p, limit: l };
    }

    // Xử lý keyword
    const kw = keyword && keyword !== "null" ? keyword : undefined;

    const whereCondition = {
      categoryId: { [Op.in]: categoryIds },
      ...(excludeProductId && { id: { [Op.ne]: excludeProductId } }),
      ...(kw && { productName: { [Op.like]: `%${kw}%` } }),
    };

    const productIdsPage = await Product.findAll({
      where: whereCondition,
      attributes: ["id"],
      limit: l,
      offset,
      raw: true,
    });

    const ids = productIdsPage.map((p) => p.id);
    if (ids.length === 0) {
      return { products: [], total: 0, page: p, limit: l };
    }

    const total = await Product.count({ where: whereCondition });

    const productsFilter = await Product.findAll({
      where: { id: { [Op.in]: ids } },
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
        {
          model: Category,
          as: "category",
          attributes: ["id", "cateName"],
        },
      ],
      group: ["Product.id"],
      order: getSortOption(sort),
      raw: false,
      nest: true,
    });

    const productFormatted = await Promise.all(
      productsFilter.map(async (p) => {
        const minPrice = parseFloat(p.get("minPrice"));
        const varient = await ProductVarient.findOne({
          where: { productId: p.id, price: minPrice },
          attributes: ["discount"],
        });
        const discount = varient ? varient.discount : 0;
        const minDiscountedPrice = minPrice - (minPrice * discount) / 100;

        const created = new Date(p.get("createdDate"));
        const now = new Date();
        const diffDays =
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        const isNew = diffDays <= 10;

        return { ...p.toJSON(), discount, minDiscountedPrice, isNew };
      })
    );

    return { products: productFormatted, total, page: p, limit: l };
  } catch (error) {
    if (error instanceof ApiError) throw error;
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
