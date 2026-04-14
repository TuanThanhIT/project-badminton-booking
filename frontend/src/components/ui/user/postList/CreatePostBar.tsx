import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useAppSelector } from "../../../../redux/hook";

/** Thanh gợi ý tạo bài mới (giống “Bạn đang nghĩ gì thế?” trên Facebook) */
const CreatePostBar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const displayName = user?.username || "Bạn";

  return (
    <Link
      to="/create-post"
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 bg-gray-100 rounded-full py-2.5 px-4 text-gray-500 text-sm">
          {displayName} ơi, bạn đang nghĩ gì thế?
        </div>
        <PlusCircle className="w-6 h-6 text-sky-600 shrink-0" />
      </div>
    </Link>
  );
};

export default CreatePostBar;
