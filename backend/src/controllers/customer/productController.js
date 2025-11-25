import productCustomerService from "../../services/customer/productService.js";

const getProductsByFilter = async (req, res, next) => {
  try {
    const cateId = req.query.category_id;
    const {
      price_range,
      size,
      color,
      material,
      product_id,
      sort,
      page,
      limit,
      keyword,
    } = req.query;
    const prices = price_range ? price_range.split("-") : [];
    const sizes = size ? size.split(",") : [];
    const colors = color ? color.split(",") : [];
    const materials = material ? material.split(",") : [];
    const excludeProductId = product_id ?? "";
    const productsFilter =
      await productCustomerService.getProductsByFilterService(
        cateId,
        prices,
        sizes,
        colors,
        materials,
        excludeProductId,
        sort,
        page,
        limit,
        keyword
      );
    return res.status(200).json(productsFilter);
  } catch (error) {
    next(error);
  }
};

const getProductsByGroupNameAndFilter = async (req, res, next) => {
  try {
    const groupName = req.query.group_name;
    const {
      price_range,
      size,
      color,
      material,
      product_id,
      sort,
      page,
      limit,
      keyword,
    } = req.query;
    const prices = price_range ? price_range.split("-") : [];
    const sizes = size ? size.split(",") : [];
    const colors = color ? color.split(",") : [];
    const materials = material ? material.split(",") : [];
    const excludeProductId = product_id ?? "";
    const productsFilter =
      await productCustomerService.getProductsByGroupNameAndFilterService(
        groupName,
        prices,
        sizes,
        colors,
        materials,
        excludeProductId,
        sort,
        page,
        limit,
        keyword
      );
    return res.status(200).json(productsFilter);
  } catch (error) {
    next(error);
  }
};

const getProductDetail = async (req, res, next) => {
  const productId = req.params.id;
  const productDetail = await productCustomerService.getProductDetailService(
    productId
  );
  return res.status(201).json(productDetail);
};

const productCustomerController = {
  getProductsByFilter,
  getProductDetail,
  getProductsByGroupNameAndFilter,
};
export default productCustomerController;
