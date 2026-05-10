export const mergeCheckoutItems = (groups: any[] = []) => {
  const map = new Map();

  groups.forEach((group) => {
    group.items.forEach((item: any) => {
      const key = item.variantId;

      if (map.has(key)) {
        const existing = map.get(key);
        existing.quantity += item.quantity;
        existing.lineTotal += item.lineTotal;
      } else {
        map.set(key, { ...item });
      }
    });
  });

  return Array.from(map.values());
};

export const formatPrice = (value: number) =>
  value?.toLocaleString("vi-VN") + "đ";

export const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const formatLeadtime = (timestamp?: number) => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

export const getShippingInfo = (group: any) => {
  const from = group.leadtime_order?.from_estimate_date;
  const to = group.leadtime_order?.to_estimate_date;

  if (!from || !to) {
    return {
      type: "single",
      text: `Giao trước: ${formatLeadtime(group.leadtime)}`,
    };
  }

  const isSame = from === to;

  if (isSame) {
    return {
      type: "same-day",
      date: formatDate(to),
      time: formatLeadtime(group.leadtime),
    };
  }

  return {
    type: "range",
    from: formatDate(from),
    to: formatDate(to),
    time: formatLeadtime(group.leadtime),
  };
};
