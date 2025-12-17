import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";

import beverageService from "../../services/admin/beverageService";
import type { BeverageItem } from "../../types/beverage";
import IconButton from "../../components/ui/admin/IconButton";
import BeverageModal from "../../components/ui/admin/BeverageModal";

export default function BeveragePage() {
  const [beverages, setBeverages] = useState<BeverageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await beverageService.getAllBeveragesService({
        page: 1,
        limit: 50,
      });
      setBeverages(res.data.beverages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<BeverageItem> = [
    {
      title: "Hình ảnh",
      dataIndex: "thumbnailUrl",
      align: "center",
      render: (url) =>
        url ? (
          <img
            src={url}
            className="w-14 h-14 rounded-lg object-cover border mx-auto"
          />
        ) : (
          <span className="italic text-gray-400">Không có ảnh</span>
        ),
    },
    {
      title: "Tên đồ uống",
      dataIndex: "name",
      align: "center",
      render: (t) => <span className="font-medium">{t}</span>,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      align: "center",
      render: (p) => (
        <span className="text-green-600 font-semibold">
          {Number(p).toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      align: "center",
      render: (s) =>
        s === 0 ? (
          <span className="text-red-500 font-semibold">Hết hàng</span>
        ) : (
          <span>{s}</span>
        ),
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, b) => (
        <button
          onClick={() => {
            setSelectedId(b.id);
            setOpenModal(true);
          }}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Chỉnh sửa
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 mb-8 relative">
            Quản lý đồ uống
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>

          <IconButton
            icon={Plus}
            text="Thêm đồ uống"
            color="bg-blue-500"
            hoverColor="hover:bg-blue-700"
            onClick={() => {
              setSelectedId(null);
              setOpenModal(true);
            }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={beverages}
          loading={loading}
          rowKey="id"
          pagination={false}
          bordered
          locale={{ emptyText: "Không có đồ uống nào" }}
        />
      </div>

      <BeverageModal
        isOpen={openModal}
        beverageId={selectedId} // null = thêm
        onClose={() => setOpenModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
