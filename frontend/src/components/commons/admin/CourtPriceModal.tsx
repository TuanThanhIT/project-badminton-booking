import React, { useEffect, useState } from "react";
import CourtPriceForm from "./CourtPriceForm";
import courtService from "../../../services/admin/courtService";
import { toast } from "react-toastify";
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Tạo giá sân</h2>

        <CourtPriceForm
          initialData={initial}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />

        {/* Danh sách giá */}
        {prices.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Danh sách giá đã tạo</h3>
            <div className="border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Thứ</th>
                    <th>Giờ</th>
                    <th>Loại</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => (
                    <tr key={p.id} className="border-t text-center">
                      <td className="p-2">{p.dayOfWeek}</td>
                      <td>
                        {p.startTime} - {p.endTime}
                      </td>
                      <td>{p.periodType}</td>
                      <td className="font-medium text-green-600">
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
  );
}
