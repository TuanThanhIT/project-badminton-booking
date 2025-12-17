import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Plus } from "lucide-react";

import beverageService from "../../services/admin/beverageService";
import type { BeverageItem } from "../../types/beverage";
import IconButton from "../../components/commons/admin/IconButton";

export default function BeveragePage() {
  const navigate = useNavigate();
  const [beverages, setBeverages] = useState<BeverageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
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
      title: "Ảnh",
      dataIndex: "thumbnailUrl",
      key: "thumbnailUrl",
      align: "center",
      render: (url) => (
        <img
          src={url}
          className="w-14 h-14 object-cover rounded border mx-auto"
        />
      ),
    },
    {
      title: "Tên đồ uống",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (t) => <span className="font-medium">{t}</span>,
    },

    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (p) => <span>{Number(p).toLocaleString()} đ</span>,
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      render: (s) => (
        <span className={s === 0 ? "text-red-500 font-semibold" : ""}>{s}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, b) => (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(`/admin/beverages/edit/${b.id}`)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-lg">Beverages</h2>

        <IconButton
          icon={Plus}
          text="Thêm đồ uống"
          color="bg-blue-500"
          hoverColor="hover:bg-blue-700"
          onClick={() => navigate("/admin/beverages/add")}
        />
      </div>

      <Table
        columns={columns}
        dataSource={beverages}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
}
