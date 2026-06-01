import { useEffect, useState } from "react";
import {
  ArrowLeft,
  GraduationCap,
  Trophy,
  Users,
  UserPlus,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import type { PostType } from "../../types/post";
import CreateFindPlayerPostForm from "../../components/ui/user/postList/CreateFindPlayerPostForm";
import CreateClassPostForm from "../../components/ui/user/postList/CreateClassPostForm";
import CreateTournamentPostForm from "../../components/ui/user/postList/CreateTournamentPostForm";
import CreateGroupPostForm from "../../components/ui/user/postList/CreateGroupPostForm";
import CreateFindCoachPostForm from "../../components/ui/user/postList/CreateFindCoachPostForm";
import { useAppSelector } from "../../redux/hook";
import { ROLE_NAME } from "../../utils/constants/role";

const POST_TYPE_LABEL: Record<PostType, string> = {
  FIND_PLAYER: "Tìm người chơi cùng",
  TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm",
  FIND_COACH: "Tìm người dạy",
  CLASS: "Lớp học",
};

const POST_TYPE_DESC: Partial<Record<PostType, string>> = {
  FIND_PLAYER: "Tìm thêm người chơi cho buổi cầu lông",
  FIND_COACH: "Tìm người dạy cầu lông phù hợp với mục tiêu tập luyện",
  CLASS: "Đăng lớp học hoặc khóa đào tạo",
  TOURNAMENT: "Thông báo giải đấu, hạng mục và lịch thi",
  GROUP: "Tạo nhóm chơi cố định theo khu vực",
};

const POST_TYPE_ICON: Partial<Record<PostType, React.ElementType>> = {
  FIND_PLAYER: UserPlus,
  FIND_COACH: GraduationCap,
  CLASS: GraduationCap,
  TOURNAMENT: Trophy,
  GROUP: Users,
};

const CreatePostPage = () => {
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const [searchParams] = useSearchParams();
  const availableTypes: PostType[] =
    userRole === ROLE_NAME.COACH
      ? ["FIND_PLAYER", "CLASS", "TOURNAMENT", "GROUP"]
      : ["FIND_PLAYER", "FIND_COACH", "TOURNAMENT", "GROUP"];

  const defaultType: PostType =
    userRole === ROLE_NAME.COACH ? "CLASS" : "FIND_PLAYER";
  const typeFromQuery = searchParams.get("type") as PostType | null;
  const initialType =
    typeFromQuery && availableTypes.includes(typeFromQuery)
      ? typeFromQuery
      : defaultType;

  const [selectedType, setSelectedType] = useState<PostType>(initialType);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);
  const ActiveIcon = POST_TYPE_ICON[selectedType] || UserPlus;

  const renderForm = () => {
    switch (selectedType) {
      case "FIND_PLAYER":
        return <CreateFindPlayerPostForm />;
      case "CLASS":
        return <CreateClassPostForm />;
      case "FIND_COACH":
        return <CreateFindCoachPostForm />;
      case "TOURNAMENT":
        return <CreateTournamentPostForm />;
      case "GROUP":
        return <CreateGroupPostForm />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative bg-sky-950 py-14 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_35%)]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-sky-800/30 skew-x-12 translate-x-20" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 text-sky-100 hover:text-white text-sm font-semibold mb-6 transition"
          >
            <ArrowLeft size={18} />
            Quay lại cộng đồng
          </Link>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sky-100 text-xs sm:text-sm font-semibold mb-5">
                <ActiveIcon size={16} className="text-sky-300" />
                Tạo bài đăng mới
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Chia sẻ với cộng đồng{" "}
                <span className="text-sky-300">B-Hub</span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-sky-100 leading-relaxed max-w-2xl">
                Tạo bài viết tìm người chơi, mở lớp, đăng giải đấu hoặc lập nhóm
                giao lưu cầu lông một cách nhanh chóng.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="relative bg-white/10 backdrop-blur-md border border-white/15 rounded-[2rem] p-5 shadow-2xl">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-400/20 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 text-sky-200 flex items-center justify-center mb-5">
                    <ActiveIcon size={30} />
                  </div>

                  <p className="text-white font-extrabold text-lg">
                    {POST_TYPE_LABEL[selectedType]}
                  </p>

                  <p className="text-sky-100 text-sm mt-2 leading-relaxed">
                    {POST_TYPE_DESC[selectedType]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 -mt-8 sm:-mt-10 relative z-20 pb-14">
        <div className="bg-white/85 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] border border-white shadow-[0_12px_45px_rgba(15,23,42,0.08)] overflow-hidden">
          {/* TABS */}
          <div className="p-3 sm:p-5 border-b border-slate-100 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableTypes.map((type) => {
                const Icon = POST_TYPE_ICON[type] || UserPlus;
                const active = selectedType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`group rounded-2xl border p-3 sm:p-4 text-left transition-all ${
                      active
                        ? "bg-sky-50 text-sky-800 border-sky-200 shadow-md shadow-sky-100"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-sky-50 hover:border-sky-100 hover:text-sky-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition ${
                        active
                          ? "bg-sky-100 text-sky-700"
                          : "bg-white text-sky-600 group-hover:bg-sky-100"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <p className="text-sm font-extrabold leading-snug">
                      {POST_TYPE_LABEL[type]}
                    </p>

                    <p
                      className={`hidden sm:block text-xs mt-1 leading-relaxed ${
                        active ? "text-sky-600" : "text-slate-400"
                      }`}
                    >
                      {POST_TYPE_DESC[type]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FORM */}
          <div className="p-4 sm:p-6 lg:p-8">{renderForm()}</div>
        </div>
      </main>
    </div>
  );
};

export default CreatePostPage;
