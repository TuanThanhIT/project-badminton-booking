import React, { useState } from "react";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  staff: string;
  status: "Upcoming" | "In Progress" | "Completed";
}

const WorkShiftPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: 1,
      name: "Ca sáng",
      startTime: "06:00",
      endTime: "12:00",
      staff: "Nguyễn Văn A",
      status: "In Progress",
    },
    {
      id: 2,
      name: "Ca chiều",
      startTime: "12:00",
      endTime: "18:00",
      staff: "Trần Thị B",
      status: "Upcoming",
    },
    {
      id: 3,
      name: "Ca tối",
      startTime: "18:00",
      endTime: "23:00",
      staff: "Lê Văn C",
      status: "Completed",
    },
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock size={22} /> Quản lý ca làm
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          <Plus size={18} /> Thêm ca làm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3">Tên ca</th>
              <th className="p-3">Giờ bắt đầu</th>
              <th className="p-3">Giờ kết thúc</th>
              <th className="p-3">Nhân viên</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr
                key={shift.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-gray-800">{shift.name}</td>
                <td className="p-3">{shift.startTime}</td>
                <td className="p-3">{shift.endTime}</td>
                <td className="p-3">{shift.staff}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shift.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : shift.status === "Upcoming"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {shift.status}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-2">
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition">
                    <Pencil size={16} />
                  </button>
                  <button className="p-2 bg-red-100 hover:bg-red-200 rounded-md text-red-600 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkShiftPage;
