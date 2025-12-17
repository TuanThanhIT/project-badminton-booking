import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Line, Doughnut } from "react-chartjs-2";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, CirclePlus } from "lucide-react";
import IconButtonNonContent from "../../components/ui/admin/IconButton";
import type { ProductAdminItem } from "../../types/product";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Plus, Gift, Banknote, LineChart } from "lucide-react";
import { useEffect, useState } from "react";
import productService from "../../services/Admin/productService";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const columns = (
  handleEdit: (p: ProductAdminItem) => void,
  handleAddVariant: (p: ProductAdminItem) => void
): ColumnsType<ProductAdminItem> => [
  {
    title: "Image",
    dataIndex: "thumbnailUrl",
    key: "thumbnailUrl",
    align: "center",
    render: (url) => (
      <div className="flex justify-center">
        <img
          className="w-16 h-16 object-cover rounded-lg shadow-md border"
          src={url}
        />
      </div>
    ),
  },
  {
    title: "Product",
    dataIndex: "productName",
    key: "productName",
    align: "center",
    render: (text) => (
      <span className="font-semibold text-gray-800">{text}</span>
    ),
  },
  {
    title: "Brand",
    dataIndex: "brand",
    key: "brand",
    align: "center",
  },
  {
    title: "Category",
    dataIndex: ["category", "cateName"],
    key: "category",
    align: "center",
    render: (c) => <span className="text-gray-700">{c}</span>,
  },
  {
    title: "Stock",
    dataIndex: "stock",
    key: "stock",
    align: "center",
    render: (stock: string) => {
      const num = Number(stock);

      return (
        <span
          className={
            num > 30
              ? "text-green-500 font-semibold"
              : num === 0
              ? "text-red-500 font-semibold"
              : "text-yellow-500 font-semibold"
          }
        >
          {num > 30
            ? `${num} in stock`
            : num === 0
            ? "Out of stock"
            : `${num} low stock`}
        </span>
      );
    },
  },
  {
    title: "Action",
    key: "action",
    align: "center",
    render: (_, product) => (
      <div className="flex justify-center gap-3">
        <IconButtonNonContent
          color="bg-green-400"
          hoverColor="hover:bg-green-500"
          onClick={() => handleEdit(product)}
          icon={Pencil}
        />
        <IconButtonNonContent
          color="bg-blue-500"
          hoverColor="hover:bg-blue-600"
          onClick={() => handleAddVariant(product)}
          icon={CirclePlus}
        />
      </div>
    ),
  },
];

const ProductPage = () => {
  const navigate = useNavigate();
  const handleEdit = (product: ProductAdminItem) => {
    navigate(`/admin/products/edit/${product.id}`);
  };
  const handleAddVariant = (product: ProductAdminItem) => {
    navigate(`/admin/products/variants?productId=${product.id}`);
  };

  const stats = [
    {
      title: "New Orders",
      value: "1,390",
      change: "+32.40%",
      icon: <Gift className="text-blue-500" />,
      up: true,
    },
    {
      title: "Sales",
      value: "$57,890",
      change: "-4.40%",
      icon: <LineChart className="text-green-500" />,
      up: false,
    },
    {
      title: "Revenue",
      value: "$12,390",
      change: "+32.40%",
      icon: <Banknote className="text-purple-500" />,
      up: true,
    },
  ];

  const profitChart = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Profit",
        data: [2000, 1500, 3200, 2800, 3600],
        borderColor: "#22C55E",
        fill: true,
        backgroundColor: "rgba(34,197,94,0.1)",
        tension: 0.4,
      },
    ],
  };

  const promoChart = {
    labels: ["YouTube", "Instagram", "Twitter", "Facebook"],
    datasets: [
      {
        data: [31.47, 26.69, 15.69, 8.22],
        backgroundColor: ["#FF0000", "#E1306C", "#1DA1F2", "#1877F2"],
      },
    ],
  };

  const topProducts = [
    { name: "Classic Casio Watch", price: "$1,290.00", rating: 5, reviews: 13 },
    {
      name: "New Wireless Headphone",
      price: "$1,000.00",
      rating: 4,
      reviews: 12,
    },
    { name: "Marc Jacob’s Decadent", price: "$220.00", rating: 3, reviews: 10 },
    {
      name: "Classic Heels For Women",
      price: "$150.90",
      rating: 5,
      reviews: 13,
    },
    { name: "Apple Watch Strap", price: "$20.00", rating: 5, reviews: 13 },
  ];

  const [products, setProducts] = useState<ProductAdminItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = async () => {
    try {
      const res = await productService.getProductsService(page, limit, search);
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách sản phẩm");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductsService();
        setProducts(res.data.products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white shadow-md border-1 border-gray-200 rounded-xl p-6">
        <div>
          <h1 className="text-2xl font-bold">
            Xin chào hôm nay bạn thế nào 👋
          </h1>
          <p className="text-gray-500">
            Đây là tất cả thông tin của hàng của bạn hôm nay, bạn có thể xem để
            biết thêm chi tiết.
          </p>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 cursor-pointer"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
        <img
          src="/img/admin_product_cover.jpg"
          alt="Dashboard Illustration"
          className="w-60 mr-8"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {s.icon}
              <h2 className="text-gray-700 font-medium">{s.title}</h2>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p
              className={`text-sm ${s.up ? "text-green-500" : "text-red-500"}`}
            >
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Total Profit</h2>
          <h3 className="text-2xl font-bold mb-4">$8,950.00</h3>
          <Line data={profitChart} />
          <p className="text-gray-500 text-sm mt-3">
            Total profit without tax included.
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Promotional Sales</h2>
          <Doughnut data={promoChart} />
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="text-red-500">● YouTube</span>
            <span className="text-pink-500">● Instagram</span>
            <span className="text-blue-400">● Twitter</span>
            <span className="text-blue-700">● Facebook</span>
          </div>
        </div>
      </div>

      {/* Stock Report */}

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h2 className="font-semibold mb-4">Stock Report</h2>
        <Table
          columns={columns(handleEdit, handleAddVariant)}
          dataSource={products}
          loading={loading}
          pagination={false}
          rowClassName={() => "text-center"}
        />
      </div>
    </div>
  );
};

export default ProductPage;
