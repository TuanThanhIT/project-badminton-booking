export type ProductResponse = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  isNew: boolean;
  minPrice: number;
  discount: number;
  minDiscountedPrice: number;
  categoryId: number;
};

export type ProductParams = {
  category_id?: number;
  group_name?: string;
  price_range: string | undefined;
  size: string | undefined;
  color: string | undefined;
  material: string | undefined;
};

export type ProductRelatedParams = {
  category_id: number;
  product_id: number;
};

export type ProductDetailResponse = {
  id: number;
  productName: string;
  brand: string;
  description: string;
  varients: [
    {
      id: number;
      sku: string;
      price: number;
      stock: number;
      discount: number;
      color: string;
      size: string;
      material: string;
      productId: number;
      discountPrice: number;
    }
  ];
  images: [
    {
      id: number;
      imageUrl: string;
      productId: number;
    }
  ];
};

export type ProductVarient = {
  id: number;
  sku: string;
  price: number;
  stock: number;
  discount: number;
  color: string;
  size: string;
  material: string;
  productId: number;
  discountPrice: number;
};
