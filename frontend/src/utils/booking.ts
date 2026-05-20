export const formatBookingCode = (
  id: string | number,
  createdDate?: string | null,
) => {
  if (!createdDate) {
    return `BK-${String(id).padStart(6, "0")}`;
  }

  const d = new Date(createdDate);

  const datePart = `${d.getFullYear().toString().slice(-2)}${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  return `BK-${datePart}-${String(id).padStart(4, "0")}`;
};
