import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import Swal from "sweetalert2";
import type { CourtItem } from "../../../src/types/court";
import courtService from "../../services/admin/courtService";
import IconButton from "../../components/commons/admin/IconButton";
import { Plus } from "lucide-react";
import AddCourtModal from "../../components/commons/admin/AddCourtModal";
import EditCourtModal from "../../components/commons/admin/EditCourtModal";
import { useSearchParams } from "react-router-dom";
import { CirclePlus, DollarSign } from "lucide-react";
import AddScheduleModal from "../../components/commons/admin/AddScheduleModal";
import CourtPriceModal from "../../components/commons/admin/CourtPriceModal";
export default function CourtPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openEditCourtModal, setOpenEditCourtModal] = useState(false);
  const [openAddScheduleModal, setOpenAddScheduleModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<CourtItem | null>(null);
  const [openAddPriceModal, setOpenAddPriceModal] = useState(false);

  const [searchParams] = useSearchParams();

  const getColumns = (): ColumnsType<CourtItem> => [
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

  const handleEdit = (court: CourtItem) => {
    setSelectedCourt(court);
    setOpenEditCourtModal(true);
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
        {openAddScheduleModal && (
          <div className="z-80">
            <AddScheduleModal
              isOpen={openAddScheduleModal}
              onClose={() => setOpenAddScheduleModal(false)}
              onSuccess={() => {
                fetchCourt();
                setOpenAddScheduleModal(false);
              }}
            />
          </div>
        )}

        {openModal && (
          <div className="z-80">
            <AddCourtModal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              onSuccess={() => {
                fetchCourt();
                setOpenModal(false);
              }}
            />
          </div>
        )}
        {openEditCourtModal && selectedCourt && (
          <div className="z-80">
            <EditCourtModal
              isOpen={openEditCourtModal}
              onClose={() => setOpenEditCourtModal(false)}
              courtId={selectedCourt.id}
              onSuccess={async () => {
                const res = await courtService.getCourtByIdService(
                  selectedCourt.id
                );
                setCourts((prev) =>
                  prev.map((c) =>
                    c.id === res.data.court.id ? res.data.court : c
                  )
                );

                setOpenEditCourtModal(false);
              }}
            />
          </div>
        )}
        {openAddPriceModal && (
          <div className="z-80">
            <CourtPriceModal
              isOpen={openAddPriceModal}
              onClose={() => setOpenAddPriceModal(false)}
            />
          </div>
        )}
        <div className="flex gap-2">
          <IconButton
            type="button"
            icon={Plus}
            text="Thêm sân"
            color="bg-blue-500"
            hoverColor="hover:bg-blue-700"
            onClick={() => setOpenModal(true)}
          />

          <IconButton
            icon={CirclePlus}
            text="Tạo lịch tuần"
            color="bg-green-500"
            hoverColor="hover:bg-green-600"
            onClick={() => setOpenAddScheduleModal(true)}
          />
          <IconButton
            icon={DollarSign}
            text="Thiết lập giá"
            color="bg-orange-500"
            hoverColor="hover:bg-orange-600"
            onClick={() => setOpenAddPriceModal(true)}
          />
        </div>
      </div>

      <Table
        columns={getColumns()}
        dataSource={courts}
        loading={loading}
        pagination={false}
        rowKey="id"
      />
    </div>
  );
}
