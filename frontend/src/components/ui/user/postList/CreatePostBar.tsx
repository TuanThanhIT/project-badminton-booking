import { Link } from "react-router-dom";
import { PlusCircle, Sparkles } from "lucide-react";
import { useAppSelector } from "../../../../redux/hook";

const CreatePostBar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const displayName = user?.username || "Bạn";

  return (
    <Link
      to="/create-post"
      className="group block overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 p-4 shadow-[0_10px_28px_rgba(14,165,233,0.08)] transition-all duration-300 hover:shadow-[0_14px_34px_rgba(14,165,233,0.12)] sm:hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-700 ring-4 ring-white transition-transform group-hover:scale-105">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white/85 px-4 py-3 text-sm text-slate-500 transition-all group-hover:border-sky-200 group-hover:text-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="shrink-0 text-sky-400" />
            <span className="truncate">
              {displayName} ơi, bạn muốn chia sẻ điều gì?
            </span>
          </div>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm transition-all group-hover:bg-sky-500 group-hover:scale-105">
          <PlusCircle className="h-6 w-6" />
        </div>
      </div>
    </Link>
  );
};

export default CreatePostBar;
