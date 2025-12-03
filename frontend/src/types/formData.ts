export type ProductFormData = {
  productName: string;
  brand: string;
  description: string;
  thumbnail: File | null;
  preview?: string | null;
  categoryId: string;
};
