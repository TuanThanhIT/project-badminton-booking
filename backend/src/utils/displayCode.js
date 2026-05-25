const formatDatePart = (createdDate) => {
  if (!createdDate) return null;

  const date = new Date(createdDate);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear().toString().slice(-2)}${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
};

export const formatBookingCode = (id, createdDate) => {
  const datePart = formatDatePart(createdDate);

  if (!datePart) {
    return `BK-${String(id).padStart(6, "0")}`;
  }

  return `BK-${datePart}-${String(id).padStart(4, "0")}`;
};

export const formatOrderCode = (id, createdDate) => {
  const datePart = formatDatePart(createdDate);

  if (!datePart) {
    return `BH-${String(id).padStart(6, "0")}`;
  }

  return `BH-${datePart}-${String(id).padStart(4, "0")}`;
};

export const formatOrderItemCode = (id) => {
  return `#OD-${String(id).padStart(4, "0")}`;
};
