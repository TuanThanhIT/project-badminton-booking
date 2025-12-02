export type ProductInfo = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  isNew: boolean;
  minPrice: number;
  discount: number;
  minDiscountedPrice: number;
  category: {
    id: number;
    cateName: string;
  };
};

export type ProductResponse = {
  products: ProductInfo[];
  total: number;
  page: number;
  limit: number;
};

export type ProductParams = {
  category_id?: number;
  group_name?: string;
  price_range?: string;
  size?: string;
  color?: string;
  material?: string;
  sort?: string;
  page?: number;
  limit?: number;
  keyword?: string;
};

export type ProPrams = {
  group_name: string;
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

export type ProductEplResponse = {
  productName: string;
  thumbnailUrl: string;
  id: number;
  sku: string;
  price: number;
  stock: number;
  size: string;
  color: string;
  material: string;
}[];

export type ProductEplRequest = {
  keyword: string;
};
