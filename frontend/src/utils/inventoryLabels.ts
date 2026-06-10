export const stockTransactionTypeLabel = (type?: string | null) => {
  const labels: Record<string, string> = {
    IMPORT: "Nhập kho",
    EXPORT: "Xuất kho",
    ADJUSTMENT: "Điều chỉnh",
    SALE: "Bán hàng",
    RETURN: "Hoàn hàng",
    CANCEL: "Hủy",
  };

  return type ? labels[type] || type : "-";
};

export const stockItemTypeLabel = (type?: string | null) => {
  const labels: Record<string, string> = {
    PRODUCT_VARIANT: "Sản phẩm",
    BEVERAGE: "Đồ uống",
  };

  return type ? labels[type] || type : "-";
};
