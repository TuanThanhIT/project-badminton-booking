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
