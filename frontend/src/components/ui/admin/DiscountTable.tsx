// src/components/admin/DiscountTable.tsx
import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminDiscountResponse } from "../../../types/discount";

interface DiscountTableProps {
  discounts: AdminDiscountResponse[];
  page: number;
  limit: number;
  onToggleLock: (id: number) => void;
  onDeleteDiscount: (id: number) => void;
}

const DiscountTable: React.FC<DiscountTableProps> = ({
  discounts,
  page,
  limit,
  onDeleteDiscount,
  onToggleLock,
}) => {
  const columns = useMemo<ColumnDef<AdminDiscountResponse>[]>(
    () => [
      {
        header: "STT",
        accessorFn: (_row, index) => index + 1 + (page - 1) * limit,
        cell: (info) => info.getValue(),
      },
      { header: "Mã giảm giá", accessorKey: "code" },
      {
        header: "Loại",
        accessorKey: "type",
        cell: (info) =>
          info.getValue() === "PERCENT" ? "Phần trăm" : "Tiền mặt",
      },
      {
        header: "Giá trị",
        accessorKey: "value",
        cell: (info) => {
          const type = info.row.original.type as "PERCENT" | "AMOUNT";
          const value = info.getValue() as number;
          return type === "PERCENT"
            ? `${value}%`
            : value.toLocaleString("vi-VN") + " đ";
        },
      },
      {
        header: "Trạng thái",
        accessorKey: "isActive",
        cell: (info) => {
          const isActive = info.getValue() as boolean;
          return (
            <span
              className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isActive ? "Hoạt động" : "Đã khóa"}
            </span>
          );
        },
      },
      {
        header: "Đã sử dụng",
        accessorKey: "isUsed",
        cell: (info) => {
          const isUsed = info.getValue() as boolean;
          return (
            <span
              className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                isUsed ? "bg-gray-700" : "bg-blue-500"
              }`}
            >
              {isUsed ? "Có" : "Chưa"}
            </span>
          );
        },
      },
      {
        header: "Ngày bắt đầu",
        accessorKey: "startDate",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
      },
      {
        header: "Ngày kết thúc",
        accessorKey: "endDate",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
      },
      {
        header: "Đơn tối thiểu",
        accessorKey: "minOrderAmount",
        cell: (info) =>
          info.getValue()
            ? (info.getValue() as number).toLocaleString("vi-VN") + " đ"
            : "-",
      },

      {
        header: "Hành động",
        cell: ({ row }) => {
          const isActive = row.original.isActive; // lấy trực tiếp từ cột trạng thái
          return (
            <div className="flex gap-2">
              <button
                onClick={() => onToggleLock(row.original.id)}
                className={`px-2 py-1 rounded text-white transition min-w-[50px] text-center ${
                  isActive
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {isActive ? "Mở" : "Khóa"}
              </button>
              <button
                onClick={() => onDeleteDiscount(row.original.id)}
                className="px-2 py-1 bg-red-500 text-white rounded min-w-[50px] hover:bg-red-600 transition"
              >
                Xóa
              </button>
            </div>
          );
        },
      },
    ],
    [page, limit]
  );

  const table = useReactTable<AdminDiscountResponse>({
    data: discounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountTable;
