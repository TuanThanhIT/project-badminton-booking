export const formatOrderCode = (
  id: string | number,
  createdDate?: string | null,
) => {
  if (!createdDate) {
    return `BH-${String(id).padStart(6, "0")}`;
  }

  const d = new Date(createdDate);

  const datePart = `${d.getFullYear().toString().slice(-2)}${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  return `BH-${datePart}-${String(id).padStart(4, "0")}`;
};

export const formatOrderItemCode = (id: number | string) => {
  return `#OD-${String(id).padStart(4, "0")}`;
};
