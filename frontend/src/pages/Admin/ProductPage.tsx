import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, CirclePlus, Plus } from "lucide-react";

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

  /* ================== RENDER ================== */
  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        <div>
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 relative">
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

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-10 relative">
          Quản lý sản phẩm
          <span className="absolute left-0 -bottom-4 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
        </h1>

        <Table
          columns={columns(handleEdit, handleAddVariant)}
          dataSource={products}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          rowClassName={() => "hover:bg-gray-50 transition-colors"}
          locale={{ emptyText: "Không có sản phẩm nào" }}
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
