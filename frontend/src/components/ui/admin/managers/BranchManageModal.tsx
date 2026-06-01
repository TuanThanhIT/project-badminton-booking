import { useState, useCallback } from "react";
import {
  X, ChevronDown, ChevronLeft, History, Building2, Plus,
  CheckCircle, XCircle, UserMinus,
} from "lucide-react";
import { toast } from "react-toastify";
import adminManagerService from "../../../../services/admin/managerService";
import type { AdminManager, AdminBranchOption } from "../../../../types/admin";
import UserAvatar from "../UserAvatar";

type BranchManageModalProps = {
  manager: AdminManager;
  branches: AdminBranchOption[];
  onClose: () => void;
  onSuccess: () => void;
};

const BranchManageModal = ({ manager, branches, onClose, onSuccess }: BranchManageModalProps) => {
  const [showAssignForm,    setShowAssignForm]    = useState(false);
  const [selectedBranchId, setSelectedBranchId]  = useState<number | "">("");
  const [note,             setNote]              = useState("");
  const [assigning,        setAssigning]         = useState(false);
  const [revokingId,       setRevokingId]        = useState<number | null>(null);
  const [historyBranchId,  setHistoryBranchId]   = useState<number | null>(null);
  const [history,          setHistory]           = useState<any[]>([]);
  const [loadingHistory,   setLoadingHistory]    = useState(false);

  const currentBranches = manager.managedBranches || [];

  const loadHistory = useCallback(async (branchId: number) => {
    setHistoryBranchId(branchId);
    setLoadingHistory(true);
    try {
      const res = await adminManagerService.getBranchManagerHistoryService(branchId);
      setHistory((res.data as any).data?.history || []);
    } catch { toast.error("Không thể tải lịch sử"); }
    finally { setLoadingHistory(false); }
  }, []);

  const handleAssign = async () => {
    if (!selectedBranchId) { toast.error("Vui lòng chọn chi nhánh"); return; }
    setAssigning(true);
    try {
      await adminManagerService.assignManagerService(Number(selectedBranchId), {
        managerId: manager.id, note,
      });
      toast.success("Gán chi nhánh thành công");
      setShowAssignForm(false);
      setSelectedBranchId("");
      setNote("");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setAssigning(false); }
  };

  const handleRevoke = async (branchManagerId: number) => {
    setRevokingId(branchManagerId);
    try {
      await adminManagerService.revokeManagerService(branchManagerId);
      toast.success("Thu hồi quyền thành công");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setRevokingId(null); }
  };

  // History sub-view
  if (historyBranchId !== null) {
    const branchName =
      branches.find((b) => b.id === historyBranchId)?.branchName ||
      currentBranches.find((b) => b.branchId === historyBranchId)?.branchName ||
      "Chi nhánh";

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl sticky top-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setHistoryBranchId(null)}
                className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <History className="w-4 h-4 text-sky-600" />
              <div>
                <h2 className="text-sm font-bold text-gray-800">Lịch sử quản lý</h2>
                <p className="text-xs text-gray-400">{branchName}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          {loadingHistory ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Chưa có lịch sử</div>
          ) : (
            <div className="p-5 space-y-3">
              {history.map((r) => (
                <div key={r.branchManagerId}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border ${r.isActive ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.isActive ? "bg-green-100" : "bg-gray-200"}`}>
                    {r.isActive
                      ? <CheckCircle className="w-4 h-4 text-green-600" />
                      : <XCircle className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{r.fullName || r.username}</p>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${r.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-200 text-gray-500 border-gray-300"}`}>
                        {r.isActive ? "Đang quản lý" : "Đã thu hồi"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{r.email}</p>
                    <div className="flex gap-4 mt-1">
                      <div>
                        <p className="text-xs text-gray-400">Ngày gán</p>
                        <p className="text-xs font-medium text-gray-700">
                          {r.assignedDate ? new Date(r.assignedDate).toLocaleDateString("vi-VN") : "—"}
                        </p>
                      </div>
                      {r.revokedDate && (
                        <div>
                          <p className="text-xs text-gray-400">Ngày thu hồi</p>
                          <p className="text-xs font-medium text-red-600">
                            {new Date(r.revokedDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      )}
                    </div>
                    {r.note && <p className="text-xs text-gray-400 italic mt-1">"{r.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <UserAvatar src={manager.avatar} name={manager.fullName || manager.username} className="w-10 h-10 rounded-xl border border-gray-200" />
            <div>
              <h2 className="text-sm font-bold text-gray-800">{manager.fullName || manager.username}</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Quản lý chi nhánh
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Chi nhánh đang quản lý ({currentBranches.length})
            </p>
            {currentBranches.length === 0 ? (
              <div className="flex flex-col items-center py-5 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Building2 className="w-7 h-7 mb-1.5 opacity-40" />
                <p className="text-sm">Chưa quản lý chi nhánh nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentBranches.map((b) => (
                  <div key={b.branchManagerId ?? b.branchId}
                    className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-800 truncate">{b.branchName}</p>
                      <p className="text-xs text-blue-500">
                        {b.assignedDate
                          ? `Từ ${new Date(b.assignedDate).toLocaleDateString("vi-VN")}`
                          : "Đang quản lý"}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => loadHistory(b.branchId)} title="Xem lịch sử"
                        className="w-7 h-7 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition">
                        <History className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (b.branchManagerId != null) handleRevoke(b.branchManagerId);
                        }}
                        disabled={b.branchManagerId == null || revokingId === b.branchManagerId}
                        title="Thu hồi quyền"
                        className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 transition disabled:opacity-60">
                        {revokingId === b.branchManagerId
                          ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <UserMinus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAssignForm ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-600">Gán chi nhánh mới</p>
              <div className="relative">
                <select value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white appearance-none">
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú (tùy chọn)..."
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setShowAssignForm(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition">
                  Hủy
                </button>
                <button onClick={handleAssign} disabled={assigning || !selectedBranchId}
                  className="flex-1 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60 transition">
                  {assigning ? "Đang gán..." : "Xác nhận"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAssignForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-sky-300 text-sky-600 text-sm font-semibold hover:bg-sky-50 transition">
              <Plus className="w-4 h-4" /> Gán chi nhánh mới
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchManageModal;
