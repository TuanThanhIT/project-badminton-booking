// CartResponse.ts
export type CartProductResponse = {
  id: number;
  quantity: number;
  subTotal: number;
  productName: string;
  thumbnailUrl: string;
  varientId: number;
  stock: number;
  color: string;
  size: string;
  material: string;
  price: number;
};

export type CartResponse = {
  id: number;
  totalAmount: number;
  cartItems: CartProductResponse[];
};
//2 cái trên dùng cho add và fetch

// dùng cho delete và update
export type CartItemResponse = {
  id: number;
  quantity: number;
  subTotal: number;
  cartId: number;
  varientId: number;
};
