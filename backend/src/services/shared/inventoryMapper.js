export const toNumber = (value) => Number(value || 0);

export const buildVariantItemName = (variant) => {
  const productName = variant.product?.productName || "Product";
  const parts = [variant.size, variant.color, variant.sku].filter(Boolean);
  return parts.length ? `${productName} - ${parts.join(" / ")}` : productName;
};

export const buildBeverageItemName = (beverage) => beverage.beverageName;
