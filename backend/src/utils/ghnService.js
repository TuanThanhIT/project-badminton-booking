export const pickDefaultService = (services) => {
  if (!services.length) return null;

  // ưu tiên "Hàng nhẹ"
  const light = services.find((s) => s.short_name === "Hàng nhẹ");

  if (light) return light;

  // fallback: lấy service đầu tiên
  return services[0];
};
