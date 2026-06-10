import { type FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Users, X } from "lucide-react";
import type { UserSearchHit } from "../../../../types/userSearch";
import MemberSearchPicker from "./MemberSearchPicker";

type CreateGroupModalProps = {
  open: boolean;
  currentUserId?: number;
  onClose: () => void;
  onSubmit: (name: string, userIds: number[]) => Promise<void>;
  searchUsers?: (q: string, limit?: number) => Promise<UserSearchHit[]>;
};

const CreateGroupModal = ({
  open,
  currentUserId,
  onClose,
  onSubmit,
  searchUsers,
}: CreateGroupModalProps) => {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<UserSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const excludeIds = useMemo(
    () => (currentUserId ? [currentUserId] : []),
    [currentUserId],
  );

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

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

  return createPortal(
    <div
      className="
        fixed inset-0 z-[99999] flex min-h-screen items-center justify-center
        bg-slate-950/60 p-4 backdrop-blur-md
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative w-full max-w-lg overflow-hidden rounded-[2rem]
          border border-slate-200 bg-white shadow-2xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600">
                <Users className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Tạo nhóm mới
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Mời bạn chơi vào cùng một cuộc trò chuyện.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex h-9 w-9 items-center justify-center rounded-xl
                border border-slate-200 text-slate-500 transition-colors
                hover:bg-slate-50 hover:text-slate-800
                disabled:cursor-not-allowed disabled:opacity-60
              "
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Tên nhóm
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full rounded-2xl border border-slate-200 bg-slate-50
                px-4 py-3 text-sm text-slate-800 transition-all
                outline-none placeholder:text-slate-400
                focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-50
              "
              placeholder="Ví dụ: Đánh cầu cuối tuần"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Thành viên
            </label>

            <MemberSearchPicker
              excludeUserIds={excludeIds}
              selected={selected}
              onSelectedChange={setSelected}
              searchUsers={searchUsers}
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
              disabled={loading}
              className="
                rounded-2xl border border-slate-200 px-5 py-2.5
                text-sm font-semibold text-slate-700 transition-colors
                hover:bg-slate-50
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-2xl bg-sky-600 px-5 py-2.5
                text-sm font-semibold text-white transition-colors
                hover:bg-sky-500
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {loading ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default CreateGroupModal;
