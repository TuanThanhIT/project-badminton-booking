import {
  MapPin,
  Target,
  Clock,
  DollarSign,
  User,
  Phone,
  MessageSquare,
  FileText,
} from "lucide-react";
import type { PostWithAuthor } from "../../../../types/post";
import { PLAYER_LEVEL_LABEL } from "../../../../utils/constants/profileConstant";

type BranchInfo = {
  branchName: string;
  address?: string;
  district?: string;
  province?: string;
  city?: string;
};

type Props = {
  post: PostWithAuthor;
  formData: Record<string, unknown>;
  branchInfo: (branchId?: number) => BranchInfo | null;
};

const infoCard = "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 p-3.5";

const FindCoachPost = ({ post, formData, branchInfo }: Props) => {
  const location = formData.location as { branchId?: number } | undefined;
  const currentLevel = formData.currentLevel as string | undefined;
  const goal = formData.goal as string | undefined;
  const scheduleNote = formData.scheduleNote as string | undefined;
  const budget = formData.budget as string | undefined;
  const contact = formData.contact as { inApp?: boolean; phone?: string | null; zalo?: string | null } | undefined;
  const notes = formData.notes as string | null | undefined;

  const branch = location?.branchId ? branchInfo(location.branchId) : null;

  return (
    <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50/70 p-4 text-slate-700">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <User className="h-5 w-5 text-sky-600" />
          {post.title}
        </h2>
        {post.content && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {post.content}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={infoCard}>
          <Target className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs text-slate-500">Mục tiêu</p>
            <p className="font-medium text-slate-800">{goal || "Chưa xác định"}</p>
          </div>
        </div>

        <div className={infoCard}>
          <User className="h-5 w-5 shrink-0 text-sky-500" />
          <div>
            <p className="text-xs text-slate-500">Trình độ hiện tại</p>
            <p className="font-medium text-slate-800">
              {currentLevel ? PLAYER_LEVEL_LABEL[currentLevel] ?? currentLevel : "Chưa cung cấp"}
            </p>
          </div>
        </div>

        <div className={infoCard}>
          <Clock className="h-5 w-5 shrink-0 text-indigo-500" />
          <div>
            <p className="text-xs text-slate-500">Thời gian</p>
            <p className="font-medium text-slate-800">{scheduleNote || "Thời gian linh hoạt"}</p>
          </div>
        </div>

        <div className={infoCard}>
          <DollarSign className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs text-slate-500">Ngân sách</p>
            <p className="font-medium text-slate-800">{budget || "Chưa cung cấp"}</p>
          </div>
        </div>
      </div>

      {(branch) && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <MapPin className="h-4 w-4 text-sky-600" />
            Thông tin địa điểm
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {[branch.branchName, branch.address, branch.district, branch.province ?? branch.city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MessageSquare className="h-4 w-4 text-sky-600" />
          Thông tin liên hệ
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          {contact?.inApp && (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
              <MessageSquare className="h-4 w-4" /> Chat trong app
            </span>
          )}
          {contact?.phone && (
            <span className="inline-flex items-center gap-1.5 font-medium text-sky-700">
              <Phone className="h-4 w-4" /> {contact.phone}
            </span>
          )}
          {contact?.zalo && (
            <span className="inline-flex items-center gap-1.5 font-medium text-sky-600">
              <MessageSquare className="h-4 w-4" /> Zalo: {contact.zalo}
            </span>
          )}
          {!contact?.inApp && !contact?.phone && !contact?.zalo && (
            <span className="text-slate-500">Chưa cung cấp thông tin liên hệ</span>
          )}
        </div>
      </div>

      {notes && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="h-4 w-4 text-amber-600" />
            Ghi chú
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{notes}</p>
        </div>
      )}
    </div>
  );
};

export default FindCoachPost;
