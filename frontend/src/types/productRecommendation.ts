export type RecommendedProduct = {
  productId: number;
  productName?: string;
  thumbnailUrl?: string;
  minPrice?: number | null;
  categoryId?: number;
  score?: number;
  reason: string;
};

export type ProductRecommendation = {
  strategy: string;
  items: RecommendedProduct[];
  modelUsed: boolean;
  productModelReady?: boolean;
};

export type ProductRecommendationResponse = {
  recommendations: ProductRecommendation;
  meta: {
    mode: string;
    userId: number | null;
    productId: number | null;
    historyCount: number;
  };
};
