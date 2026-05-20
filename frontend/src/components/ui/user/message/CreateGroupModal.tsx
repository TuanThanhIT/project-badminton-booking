import { type FormEvent, useMemo, useState } from "react";
import { Users, X } from "lucide-react";
import type { UserSearchHit } from "../../../../types/userSearch";
import MemberSearchPicker from "./MemberSearchPicker";

type CreateGroupModalProps = {
  open: boolean;
  currentUserId?: number;
  onClose: () => void;
  onSubmit: (name: string, userIds: number[]) => Promise<void>;
};

const CreateGroupModal = ({
  open,
  currentUserId,
  onClose,
  onSubmit,
}: CreateGroupModalProps) => {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<UserSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const excludeIds = useMemo(
    () => (currentUserId ? [currentUserId] : []),
    [currentUserId],
  );

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const userIds = selected.map((u) => u.id);
    if (!name.trim()) {
      setError("Nhập tên nhóm.");
      return;
    }
    if (userIds.length < 1) {
      setError("Chọn ít nhất một thành viên.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(name.trim(), userIds);
      setName("");
      setSelected([]);
      onClose();
    } catch {
      setError("Không tạo được nhóm. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/60">
        <div className="px-6 py-5 bg-sky-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_35%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-200" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold">Tạo nhóm mới</h3>
                <p className="text-sm text-sky-100 mt-1">
                  Mời bạn chơi vào cùng một cuộc trò chuyện.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Tên nhóm
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-100 focus:border-sky-400 transition-all"
              placeholder="Ví dụ: Đánh cầu cuối tuần"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Thành viên
            </label>
            <MemberSearchPicker
              excludeUserIds={excludeIds}
              selected={selected}
              onSelectedChange={setSelected}
              placeholder="Tìm theo tên hoặc username..."
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-bold rounded-2xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50 transition-colors shadow-lg shadow-sky-600/20"
            >
              {loading ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
