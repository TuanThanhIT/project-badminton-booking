import { useCallback, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import adminUserService from "../../../../services/admin/userService";
import type { AdminModerationViolation } from "../../../../types/admin";
import AdminModal from "../AdminModal";
import AdminPagination from "../AdminPagination";

const LIMIT = 10;
const LABEL_TEXT: Record<string, string> = {
  spam: "Spam",
  unauthorized_ad: "Quảng cáo trái phép",
  offensive: "Công kích / xúc phạm",
};

const UserViolationsModal = ({
  userId,
  username,
  onClose,
}: {
  userId: number;
  username: string;
  onClose: () => void;
}) => {
  const [violations, setViolations] = useState<AdminModerationViolation[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchViolations = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await adminUserService.getUserModerationViolationsService(userId, {
          page,
          limit: LIMIT,
        });
      const data = (response.data as any).data;
      setViolations(data.violations || []);
      setTotal(data.pagination?.total || 0);
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải lịch sử vi phạm");
    } finally {
      setLoading(false);
    }
  }, [page, userId]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return (
    <AdminModal
      title="Lịch sử vi phạm"
      description={`Tài khoản @${username}`}
      icon={<ShieldAlert className="h-5 w-5 text-rose-600" />}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : violations.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 py-12 text-center text-sm text-emerald-700">
            Tài khoản chưa có vi phạm kiểm duyệt.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3 text-center">#</th>
                    <th className="px-3 py-3 text-center">Nhãn</th>
                    <th className="px-3 py-3 text-center">Nguồn</th>
                    <th className="px-3 py-3 text-center">Tin cậy</th>
                    <th className="px-3 py-3 text-left">Lý do</th>
                    <th className="px-3 py-3 text-center">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {violations.map((violation, index) => (
                    <tr key={violation.id}>
                      <td className="px-3 py-3 text-center text-slate-400">
                        {(page - 1) * LIMIT + index + 1}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                          {LABEL_TEXT[violation.label] || violation.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {violation.source === "AI" ? "AI" : "Quản trị viên"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {violation.confidence != null
                          ? `${(violation.confidence * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="max-w-[260px] px-3 py-3 text-slate-600">
                        {violation.reason || "—"}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-slate-500">
                        {new Date(violation.createdAt).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={page}
              totalPages={Math.max(Math.ceil(total / LIMIT), 1)}
              total={total}
              onPage={setPage}
              unit="vi phạm"
            />
          </div>
        )}
      </div>
    </AdminModal>
  );
};

export default UserViolationsModal;
