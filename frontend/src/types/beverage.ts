export type BeverageEplResponse = {
  id: number;
  name: string;
  thumbnailUrl: string;
  stock: number;
  price: number;
}[];

export type BeverageEplRequest = {
  keyword: string;
};
//Admin
export type BeverageItem = {
  id: number;
  name: string;
  thumbnailUrl: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateBeverageRequest = {
  name: string;
  price: number;
  stock: number;
  file?: File;
};

export type UpdateBeverageRequest = Partial<
  Omit<CreateBeverageRequest, "file">
> & {
  file?: File;
};

export type BeverageListRequest = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export type BeverageListResponse = {
  beverages: BeverageItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type BeverageDetailResponse = {
  beverage: BeverageItem;
};
export type BeverageFormData = {
  name: string;
  price: string;
  stock: string;
  file: File | null;
  preview: string | null;
};
