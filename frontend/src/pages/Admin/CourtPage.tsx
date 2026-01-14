import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CourtItem } from "../../types/court";
import courtService from "../../services/admin/courtService";
import IconButton from "../../components/ui/admin/IconButton";
import { Plus, CirclePlus, DollarSign, Pencil } from "lucide-react";
import AddCourtModal from "../../components/ui/admin/AddCourtModal";
import EditCourtModal from "../../components/ui/admin/EditCourtModal";
import AddScheduleModal from "../../components/ui/admin/AddScheduleModal";
import CourtPriceModal from "../../components/ui/admin/CourtPriceModal";

export default function CourtPage() {
  const [courts, setCourts] = useState<CourtItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddCourt, setOpenAddCourt] = useState(false);
  const [openEditCourt, setOpenEditCourt] = useState(false);
  const [openAddSchedule, setOpenAddSchedule] = useState(false);
  const [openAddPrice, setOpenAddPrice] = useState(false);

  const [selectedCourt, setSelectedCourt] = useState<CourtItem | null>(null);

  const fetchCourts = async () => {
    try {
      const res = await courtService.getAllCourtsService();
      setCourts(res.data.courts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleEdit = (court: CourtItem) => {
    setSelectedCourt(court);
    setOpenEditCourt(true);
  };

  const columns: ColumnsType<CourtItem> = [
    {
      title: "Hình ảnh",
      dataIndex: "thumbnailUrl",
      key: "thumbnailUrl",
      align: "center",
      width: 120,
      render: (thumb: string) =>
        thumb ? (
          <img
            src={thumb}
            alt="Sân"
            className="w-14 h-14 object-cover rounded-lg mx-auto border"
          />
        ) : (
          <span className="text-gray-400 italic">Chưa có</span>
        ),
    },
    {
      title: "Tên sân",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      align: "center",
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, court) => (
        <button
          onClick={() => handleEdit(court)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm
                     bg-sky-500 hover:bg-sky-600 text-white rounded-md transition"
        >
          <Pencil size={14} />
          Sửa
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="flex items-center justify-between mb-10">
          {/* ===== TIÊU ĐỀ ===== */}
          <h1 className="inline-flex items-center gap-2 text-2xl font-bold text-sky-700 relative">
            Quản lý sân cầu lông
            <span className="absolute left-0 -bottom-4 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>

          {/* ===== BUTTON TOOLBAR ===== */}
          <div className="flex justify-end gap-2">
            <IconButton
              icon={Plus}
              text="Thêm sân"
              color="bg-sky-500"
              hoverColor="hover:bg-sky-600"
              onClick={() => setOpenAddCourt(true)}
            />

            <IconButton
              icon={CirclePlus}
              text="Tạo lịch"
              color="bg-green-500"
              hoverColor="hover:bg-green-600"
              onClick={() => setOpenAddSchedule(true)}
            />

            <IconButton
              icon={DollarSign}
              text="Tạo giá"
              color="bg-orange-500"
              hoverColor="hover:bg-orange-600"
              onClick={() => setOpenAddPrice(true)}
            />
          </div>
        </div>

        {/* ===== BẢNG ===== */}
        <Table
          columns={columns}
          dataSource={courts}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
          }}
          bordered
          className="rounded-xl overflow-hidden"
          rowClassName={(_, index) =>
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          }
          locale={{ emptyText: "Không có sân nào" }}
        />
      </div>

      {/* ===== MODALS ===== */}
      {openAddCourt && (
        <AddCourtModal
          isOpen={openAddCourt}
          onClose={() => setOpenAddCourt(false)}
          onSuccess={() => {
            fetchCourts();
            setOpenAddCourt(false);
          }}
        />
      )}

      {openEditCourt && selectedCourt && (
        <EditCourtModal
          isOpen={openEditCourt}
          courtId={selectedCourt.id}
          onClose={() => setOpenEditCourt(false)}
          onSuccess={fetchCourts}
        />
      )}

      {openAddSchedule && (
        <AddScheduleModal
          isOpen={openAddSchedule}
          onClose={() => setOpenAddSchedule(false)}
          onSuccess={() => {
            fetchCourts();
            setOpenAddSchedule(false);
          }}
        />
      )}

      {openAddPrice && (
        <CourtPriceModal
          isOpen={openAddPrice}
          onClose={() => setOpenAddPrice(false)}
        />
      )}
    </div>
  );
}
