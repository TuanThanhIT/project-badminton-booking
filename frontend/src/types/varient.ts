export type ProductVariant = {
  id: number;
  sku: string;
  price: number;
  stock: number;
  discount: number;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  productId: number;
  discountPrice?: number;
};
export type CreateVariantInput = {
  sku: string;
  price: number;
  stock: number;
  discount: number;
  color?: string;
  size?: string;
  material?: string;
  productId: number;
};
