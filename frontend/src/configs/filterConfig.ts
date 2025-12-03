const filterConfig: Record<string, any[]> = {
  "Vợt cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 5000000,
    },
    {
      key: "size",
      label: "Size",
      type: "checkbox",
      options: ["2U (90-94g)", "3U (85-89g)", "4U (80-84g)", "5U (75-79g)"],
    },
    {
      key: "color",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Xanh", "Đỏ", "Trắng"],
    },
    {
      key: "material",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Carbon", "Graphite", "Polyester"],
    },
  ],
  "Giày cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 5000000,
    },
    {
      key: "size",
      label: "Size",
      type: "checkbox",
      options: ["38", "39", "40", "41", "42", "43", "44"],
    },
    {
      key: "color",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Trắng", "Đen", "Xanh", "Đỏ"],
    },
    {
      key: "material",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Da tổng hợp", "Vải lưới"],
    },
  ],
  "Áo cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
    {
      key: "size",
      label: "Size",
      type: "checkbox",
      options: ["S", "M", "L", "XL"],
    },
    {
      key: "color",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Trắng", "Xanh dương", "Vàng"],
    },
    {
      key: "material",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Cotton"],
    },
  ],
  "Quần cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
    {
      key: "size",
      label: "Size",
      type: "checkbox",
      options: ["S", "M", "L", "XL"],
    },
    {
      key: "color",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Trắng", "Xanh"],
    },
    {
      key: "material",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Cotton"],
    },
  ],
  "Váy cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
    {
      key: "size",
      label: "Size",
      type: "checkbox",
      options: ["S", "M", "L", "XL"],
    },
    {
      key: "color",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Hồng", "Trắng", "Xanh"],
    },
    {
      key: "material",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Cotton"],
    },
  ],
  "Túi vợt cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 100000,
      max: 10000000,
    },
    {
      key: "color",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Xanh", "Đỏ"],
    },
    {
      key: "material",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Da"],
    },
  ],
  "Balo cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 200000,
      max: 10000000,
    },
    {
      key: "color",
      label: "Màu sắc",
      type: "checkbox",
      options: ["Đen", "Xanh", "Đỏ"],
    },
    {
      key: "material",
      label: "Chất liệu",
      type: "checkbox",
      options: ["Polyester", "Canvas"],
    },
  ],
  "Phụ kiện cầu lông": [
    {
      key: "priceRange",
      label: "Khoảng giá",
      type: "range",
      min: 50000,
      max: 1000000,
    },
  ],
};

export default filterConfig;
