export type CategoryResponse = {
  menuGroup: string;
  items: [{ id: number; cateName: string }];
};

export type CategoryOtherResponse = {
  id: number;
  cateName: string;
};
