import { useMemo, useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo nhóm</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên nhóm
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Ví dụ: Đánh cầu cuối tuần"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thêm thành viên (tìm theo tên hoặc username)
            </label>
            <MemberSearchPicker
              excludeUserIds={excludeIds}
              selected={selected}
              onSelectedChange={setSelected}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? "Đang tạo…" : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
