import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import courtService from "../../services/Admin/courtService";
import IconButton from "../../components/commons/admin/IconButton";
import { Plus } from "lucide-react";
import AddCourtModal from "../../components/commons/admin/AddCourtModal";

export default function CourtPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const columns: ColumnsType<any> = [
    {
      title: "Ảnh",
      dataIndex: "thumbnailUrl",
      key: "thumbnailUrl",
      align: "center",
      render: (thumb: string) =>
        thumb ? (
          <img
            src={thumb}
            alt="court"
            className="w-16 h-16 object-cover rounded-md mx-auto"
          />
        ) : (
          <span className="text-gray-400 italic">Không có ảnh</span>
        ),
    },
    {
      title: "Tên sân",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      align: "center",
    },

    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, court) => (
        <div className="flex justify-center gap-3">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md"
            onClick={() => handleEdit(court)}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (court: any) => {
    // mở modal edit hoặc điều hướng sang trang chỉnh sửa
  };

  const fetchCourt = async () => {
    try {
      const res = await courtService.getAllCourtsService();
      setCourts(res.data.courts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourt();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Danh sách sân</h2>

        <IconButton
          type="button"
          icon={Plus}
          text="Thêm sân"
          color="bg-blue-500"
          hoverColor="hover:bg-blue-700"
          onClick={() => setOpenModal(true)}
        />
      </div>

      {openModal && (
        <AddCourtModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSuccess={() => {
            fetchCourt();
            setOpenModal(false);
          }}
        />
      )}

      <Table
        columns={columns}
        dataSource={courts}
        loading={loading}
        pagination={false}
        rowKey="id"
      />
    </div>
  );
}
