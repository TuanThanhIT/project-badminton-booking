import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Line, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Pencil,
  CirclePlus,
  Plus,
  Gift,
  Banknote,
  LineChart,
} from "lucide-react";

import IconButtonNonContent from "../../components/ui/admin/IconButton";
import type { ProductAdminItem } from "../../types/product";
import productService from "../../services/admin/productService";

import AddProductModal from "../../components/ui/admin/AddProductModal";
import EditProductModal from "../../components/ui/admin/EditProductModal";

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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

/* ================== TABLE COLUMNS ================== */
const columns = (
  handleEdit: (p: ProductAdminItem) => void,
  handleAddVariant: (p: ProductAdminItem) => void
): ColumnsType<ProductAdminItem> => [
  {
    title: "Hình ảnh",
    dataIndex: "thumbnailUrl",
    key: "thumbnailUrl",
    align: "center",
    render: (url) => (
      <img
        src={url}
        className="w-16 h-16 object-cover rounded-lg border shadow"
      />
    ),
  },
  {
    title: "Sản phẩm",
    dataIndex: "productName",
    key: "productName",
    align: "center",
    render: (text) => (
      <span className="font-semibold text-gray-800">{text}</span>
    ),
  },
  {
    title: "Thương hiệu",
    dataIndex: "brand",
    key: "brand",
    align: "center",
  },
  {
    title: "Danh mục",
    dataIndex: ["category", "cateName"],
    key: "category",
    align: "center",
  },
  {
    title: "Tồn kho",
    dataIndex: "stock",
    key: "stock",
    align: "center",
    render: (stock: number) => (
      <span
        className={
          stock > 30
            ? "text-green-600 font-semibold"
            : stock === 0
            ? "text-red-500 font-semibold"
            : "text-yellow-500 font-semibold"
        }
      >
        {stock > 30
          ? `${stock} còn hàng`
          : stock === 0
          ? "Hết hàng"
          : `${stock} sắp hết`}
      </span>
    ),
  },
  {
    title: "Thao tác",
    key: "action",
    align: "center",
    render: (_, product) => (
      <div className="flex justify-center gap-3">
        <IconButtonNonContent
          color="bg-green-500"
          hoverColor="hover:bg-green-600"
          icon={Pencil}
          onClick={() => handleEdit(product)}
        />
        <IconButtonNonContent
          color="bg-blue-500"
          hoverColor="hover:bg-blue-600"
          icon={CirclePlus}
          onClick={() => handleAddVariant(product)}
        />
      </div>
    ),
  },
];

/* ================== PAGE ================== */
const ProductPage = () => {
  const navigate = useNavigate();

  /* ---------- STATE ---------- */
  const [products, setProducts] = useState<ProductAdminItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  /* ---------- FETCH PRODUCTS ---------- */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductsService();
      setProducts(res.data.products);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- HANDLERS ---------- */
  const handleEdit = (product: ProductAdminItem) => {
    setEditId(product.id);
  };

  const handleAddVariant = (product: ProductAdminItem) => {
    navigate(`/admin/products/variants?productId=${product.id}`);
  };

  /* ---------- STATS (UI ONLY) ---------- */
  const stats = [
    {
      title: "Đơn hàng mới",
      value: "1,390",
      change: "+32.4%",
      icon: <Gift className="text-blue-500" />,
      up: true,
    },
    {
      title: "Doanh số",
      value: "$57,890",
      change: "-4.4%",
      icon: <LineChart className="text-green-500" />,
      up: false,
    },
    {
      title: "Doanh thu",
      value: "$12,390",
      change: "+32.4%",
      icon: <Banknote className="text-purple-500" />,
      up: true,
    },
  ];

  const profitChart = {
    labels: ["T2", "T3", "T4", "T5", "T6"],
    datasets: [
      {
        label: "Lợi nhuận",
        data: [2000, 1500, 3200, 2800, 3600],
        borderColor: "#22C55E",
        backgroundColor: "rgba(34,197,94,0.1)",
        tension: 0.4,
        fill: true,
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

  /* ================== RENDER ================== */
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Xin chào 👋 Chúc bạn một ngày làm việc hiệu quả
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý toàn bộ sản phẩm của cửa hàng tại đây
          </p>

          <button
            onClick={() => setOpenAdd(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>

        <img
          src="/img/admin_product_cover.jpg"
          className="w-56 hidden md:block"
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              {s.icon}
              <span className="font-medium text-gray-700">{s.title}</span>
            </div>
            <div className="text-2xl font-bold mt-2">{s.value}</div>
            <div
              className={`text-sm ${s.up ? "text-green-500" : "text-red-500"}`}
            >
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Tổng lợi nhuận</h2>
          <Line data={profitChart} />
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Kênh bán hàng</h2>
          <Doughnut data={promoChart} />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Danh sách sản phẩm</h2>

        <Table
          columns={columns(handleEdit, handleAddVariant)}
          dataSource={products}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </div>

      {/* MODALS */}
      <AddProductModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchProducts}
      />

      <EditProductModal
        open={!!editId}
        productId={editId}
        onClose={() => setEditId(null)}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default ProductPage;
