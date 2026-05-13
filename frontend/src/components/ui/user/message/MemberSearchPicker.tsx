import { useCallback, useEffect, useState } from "react";
import type { UserSearchHit } from "../../../../types/userSearch";
import userSearchService from "../../../../services/user/userSearchService";

type MemberSearchPickerProps = {
  excludeUserIds: number[];
  selected: UserSearchHit[];
  onSelectedChange: (users: UserSearchHit[]) => void;
  placeholder?: string;
};

const useDebounced = <T,>(value: T, ms: number): T => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

const MemberSearchPicker = ({
  excludeUserIds,
  selected,
  onSelectedChange,
  placeholder = "Tìm theo tên hoặc username...",
}: MemberSearchPickerProps) => {
  const formatUserLabel = (u: UserSearchHit) => {
    const name = u.fullName?.trim();
    return name ? `${name} (${u.username})` : u.username;
  };

  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 320);
  const [hits, setHits] = useState<UserSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const excludeSet = useCallback(
    () => new Set([...excludeUserIds, ...selected.map((s) => s.id)]),
    [excludeUserIds, selected],
  );

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 1) {
      setHits([]);
      setErr("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErr("");
    userSearchService
      .searchUsersService(q, 15)
      .then((res) => {
        if (cancelled) return;
        const ex = excludeSet();
        setHits((res.data.data || []).filter((u) => !ex.has(u.id)));
      })
      .catch(() => {
        if (!cancelled) {
          setErr("Không tải được danh sách.");
          setHits([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, excludeSet]);

  const addOne = (u: UserSearchHit) => {
    if (excludeSet().has(u.id)) return;
    onSelectedChange([...selected, u]);
    setQuery("");
    setHits([]);
  };

  const removeOne = (id: number) => {
    onSelectedChange(selected.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all placeholder:text-slate-400"
        placeholder={placeholder}
        autoComplete="off"
      />
      {loading ? <p className="text-xs text-slate-500">Đang tìm...</p> : null}
      {err ? <p className="text-xs text-rose-600">{err}</p> : null}

      {hits.length > 0 ? (
        <ul className="max-h-40 overflow-y-auto border border-slate-200 rounded-2xl bg-white text-sm shadow-sm">
          {hits.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-sky-50 border-b border-slate-100 last:border-0 transition-colors"
                onClick={() => addOne(u)}
              >
                <span className="font-semibold text-slate-900">
                  {formatUserLabel(u)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-800 text-xs font-semibold"
            >
              {formatUserLabel(u)}
              <button
                type="button"
                className="hover:text-rose-600 font-bold leading-none"
                aria-label={`Bỏ ${u.username}`}
                onClick={() => removeOne(u.id)}
              >
                x
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default MemberSearchPicker;
