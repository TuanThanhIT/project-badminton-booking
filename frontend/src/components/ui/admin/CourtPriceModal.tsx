import { useState } from "react";
import { X } from "lucide-react";
import CourtPriceForm from "./CourtPriceForm";
import courtService from "../../../services/admin/courtService";
import type {
  CourtPriceItem,
  CreateCourtPriceRequest,
} from "../../../types/court";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourtPriceModal({ isOpen, onClose }: Props) {
  const [prices, setPrices] = useState<CourtPriceItem[]>([]);

  if (!isOpen) return null;

  const initial: CreateCourtPriceRequest = {
    dayOfWeek: "Monday",
    startTime: "",
    endTime: "",
    price: 0,
    periodType: "Daytime",
  };

  const handleSubmit = async (data: CreateCourtPriceRequest) => {
    const res = await courtService.createCourtPriceService(data);
    setPrices((prev) => [...prev, ...res.data.prices]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Tạo giá sân</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <CourtPriceForm
            initialData={initial}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />

          {prices.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">
                Danh sách giá đã tạo
              </h3>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Thứ</th>
                      <th className="px-3 py-2 text-center">Khung giờ</th>
                      <th className="px-3 py-2 text-center">Loại</th>
                      <th className="px-3 py-2 text-right">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2">{p.dayOfWeek}</td>
                        <td className="px-3 py-2 text-center">
                          {p.startTime} – {p.endTime}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {p.periodType}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-green-600">
                          {p.price.toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
