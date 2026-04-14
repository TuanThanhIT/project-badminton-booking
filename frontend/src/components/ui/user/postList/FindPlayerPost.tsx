import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
  Phone,
  MessageCircle,
  FileText,
  Target,
  MessageSquare,
  Disc,
} from "lucide-react";
import type { PostWithAuthor } from "../../../../types/post";

type Props = {
  post: PostWithAuthor;
  formData: Record<string, unknown>;
  branchInfo: (branchId?: number) => { branchName: string; address?: string; district?: string; city?: string } | null;
  courtNameById: Record<number, string>;
  formatLevel: (level?: string, customLevel?: string | null) => string;
};

const FindPlayerPost = ({ post, formData, branchInfo, courtNameById, formatLevel }: Props) => {
  const location = formData.location as { branchId?: number; courtId?: number } | undefined;
  const schedule = formData.schedule as { date?: string; startTime?: string; endTime?: string } | undefined;
  const playerRequirement = formData.playerRequirement as { level?: string; customLevel?: string | null; slotsNeeded?: number } | undefined;
  const contact = formData.contact as { inApp?: boolean; phone?: string | null; zalo?: string | null } | undefined;
  const notes = formData.notes as string | null | undefined;

  const branch = location?.branchId ? branchInfo(location.branchId) : null;
  const courtName = location?.courtId ? courtNameById[location.courtId] || `Sân ${location.courtId}` : "";
  const levelDisplay = formatLevel(playerRequirement?.level, playerRequirement?.customLevel);

  const playDate = schedule?.date
    ? new Date(schedule.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "Chưa xác định";
  const timeDisplay = schedule?.startTime || schedule?.endTime
    ? `${schedule.startTime || "?"} - ${schedule.endTime || "?"}`
    : "Chưa xác định";

  return (
    <div className="mt-0 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50 p-3 sm:p-4 font-sans">
      <div className="mb-3">
        <h2 className="text-[#1a365d] font-bold text-xl flex items-center gap-2 mb-1.5">
          <User className="w-5 h-5 text-[#3b82f6]" strokeWidth={2.5} />
          {post.title}
        </h2>
        {post.content && (
          <p className="text-[#476082] text-sm font-medium">
            {post.content}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 p-2.5 bg-[#f8fbff] rounded-xl border border-blue-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Ngày chơi</p>
            <p className="font-semibold text-gray-900">{playDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-[#faf5ff] rounded-xl border border-purple-50">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Thời gian</p>
            <p className="font-semibold text-gray-900">{timeDisplay}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-[#fff8f3] rounded-xl border border-orange-50">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Trình độ cần tìm</p>
            <p className="font-semibold text-gray-900">{levelDisplay || "Không yêu cầu"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-[#fff5f5] rounded-xl border border-rose-50">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Cần tìm</p>
            <p className="font-semibold text-gray-900">
              {playerRequirement?.slotsNeeded ? `${playerRequirement.slotsNeeded} người chơi` : "Đang cập nhật"}
            </p>
          </div>
        </div>
      </div>

      {(branch || courtName) && (
        <div className="border-t border-[#d6e4f0] pt-3 mb-3">
          <h3 className="font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Thông tin sân
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm text-[#334155] font-medium ml-3">
            {branch && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{branch.branchName}</span>
              </div>
            )}
            {courtName && (
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{courtName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-[#d6e4f0] pt-3 mb-3">
        <h3 className="font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Thông tin liên hệ
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-sm ml-3">
          {contact?.inApp && (
            <div className="flex items-center gap-1.5 text-[#059669] font-semibold">
              <MessageSquare className="w-4 h-4" /> Chat trong app
            </div>
          )}
          {contact?.phone && (
            <div className="flex items-center gap-1.5 text-[#2563eb] font-semibold">
              <Phone className="w-4 h-4" /> {contact.phone}
            </div>
          )}
          {contact?.zalo && (
            <div className="flex items-center gap-1.5 text-[#0ea5e9] font-semibold">
              <MessageCircle className="w-4 h-4" /> Zalo: {contact.zalo}
            </div>
          )}
          {!contact?.inApp && !contact?.phone && !contact?.zalo && (
            <span className="text-gray-500 italic font-medium">Chưa cung cấp thông tin liên hệ</span>
          )}
        </div>
      </div>

      {notes && (
        <div className="border-t border-[#d6e4f0] pt-3">
          <h3 className="font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Ghi chú
          </h3>
          <div className="bg-white rounded-xl p-3 text-sm text-gray-700 font-medium shadow-sm border border-gray-100">
            {notes}
          </div>
        </div>
      )}

    </div>
  );
};

export default FindPlayerPost;