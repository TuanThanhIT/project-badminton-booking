import { useEffect, useState } from "react";
import { Table, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusCircle, Search } from "lucide-react";
import { toast } from "react-toastify";

import categoryService from "../../services/admin/categoryService";
import type { CategoryItem } from "../../types/category";
import type { ApiErrorType } from "../../types/error";

import AddCategoryModal from "../../components/ui/admin/CategoryModal";

const LIMIT = 10;

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(LIMIT);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchCategories = async (
    pageParam = page,
    limitParam = limit,
    searchParam = search
  ) => {
    setLoading(true);
    try {
      const res = await categoryService.getCategoriesService(
        pageParam,
        limitParam,
        searchParam
      );

      setCategories(res.data.data);
      setTotal(res.data.pagination.totalItems);
      setPage(pageParam);
      setLimit(limitParam);
    } catch (error) {
      const apiError = error as ApiErrorType;
      toast.error(apiError.userMessage || "Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, limit, search);
  }, [search]);

  /* ================= TABLE COLUMNS ================= */
  const columns: ColumnsType<CategoryItem> = [
    {
      title: "#",
      align: "center",
      width: 80,
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Tên danh mục",
      dataIndex: "cateName",
      render: (v) => <span className="font-semibold">{v}</span>,
    },
    {
      title: "Nhóm menu",
      dataIndex: "menuGroup",
      align: "center",
      render: (v) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
          {v}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      align: "right",
      render: (d) => new Date(d).toLocaleDateString("vi-VN"),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 space-y-6">
        {/* ===== HEADER ===== */}
        <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 relative mb-8">
          Quản lý danh mục
          <span className="absolute left-0 -bottom-4 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
        </h1>

        <div className="flex items-center justify-between">
          {/* ===== SEARCH ===== */}
          <div className="w-full md:w-1/3">
            <Input
              allowClear
              placeholder="Tìm kiếm danh mục..."
              prefix={<Search size={16} className="text-gray-400 py-3" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            <PlusCircle size={20} />
            Thêm danh mục
          </button>
        </div>

        {/* ===== TABLE ===== */}
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showLessItems: true,
            showTotal: (t) => `Tổng ${t} danh mục`,
            onChange: (newPage, newLimit) => {
              fetchCategories(newPage, newLimit);
            },
          }}
        />

        {/* ===== MODAL ===== */}
        <AddCategoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchCategories(page, limit)}
        />
      </div>
    </div>
  );
}
