const filterConfig: Record<string, any[]> = {
  "VỢT CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 5000000,
    },
    {
      key: "sizes",
      label: "Size",
      type: "checkbox",
      options: ["2U", "3U", "4U", "5U"],
    },
    {
      key: "colors",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Xanh", "Đỏ", "Trắng"],
    },
    {
      key: "materials",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Carbon", "Graphite", "Polyester"],
    },
  ],
  "GIÀY CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 5000000,
    },
    {
      key: "sizes",
      label: "Size",
      type: "checkbox",
      options: ["38", "39", "40", "41", "42", "43", "44"],
    },
    {
      key: "colors",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Trắng", "Đen", "Xanh", "Đỏ"],
    },
    {
      key: "materials",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Da tổng hợp", "Vải lưới"],
    },
  ],
  "ÁO CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
    {
      key: "sizes",
      label: "Size",
      type: "checkbox",
      options: ["S", "M", "L", "XL"],
    },
    {
      key: "colors",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Trắng", "Xanh dương", "Vàng", "Đỏ"],
    },
    {
      key: "materials",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Cotton"],
    },
  ],
  "QUẦN CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
    {
      key: "sizes",
      label: "Size",
      type: "checkbox",
      options: ["S", "M", "L", "XL"],
    },
    {
      key: "colors",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Trắng", "Xanh"],
    },
    {
      key: "materials",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Cotton"],
    },
  ],
  "VÁY CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
    {
      key: "sizes",
      label: "Size",
      type: "checkbox",
      options: ["S", "M", "L", "XL"],
    },
    {
      key: "colors",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Hồng", "Trắng", "Xanh"],
    },
    {
      key: "materials",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Cotton"],
    },
  ],
  "TÚI VỢT CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "ranges",
      min: 100000,
      max: 10000000,
    },
    {
      key: "colors",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Xanh", "Đỏ"],
    },
    {
      key: "materials",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Da"],
    },
  ],
  "BALO CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "range",
      min: 200000,
      max: 10000000,
    },
    {
      key: "colors",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Xanh", "Đỏ"],
    },
    {
      key: "materials",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Canvas"],
    },
  ],
  "PHỤ KIỆN CẦU LÔNG": [
    {
      key: "pricesRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
  ],
};

export default filterConfig;
