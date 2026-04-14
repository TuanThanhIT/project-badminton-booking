import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Smartphone,
  Users,
  Info,
} from "lucide-react";
import type { PostWithAuthor } from "../../../../types/post";

type Props = {
  post: PostWithAuthor;
  formData: Record<string, unknown>;
  branchInfo: (branchId?: number) => { branchName: string; address?: string; district?: string; city?: string } | null;
  courtNameById: Record<number, string>;
};

const TournamentPost = ({ post, formData, branchInfo, courtNameById }: Props) => {
  // Parse formData
  const organizerName = formData.organizerName as string | undefined;
  const location = formData.location as { branchId?: number; courtId?: number } | undefined;
  const registration = formData.registration as { startDate?: string; endDate?: string } | undefined;
  const eventDate = formData.eventDate as string | undefined;
  const categories = formData.categories as string[] | undefined;
  const contact = formData.contact as { phone?: string | null; email?: string | null; inApp?: boolean } | undefined;

  // Get branch info
  const branch = location?.branchId ? branchInfo(location.branchId) : null;
  const courtName = location?.courtId ? courtNameById[location.courtId] || `Sân ${location.courtId}` : "";

  return (
    <div className="mt-0">
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50 px-3 py-2 sm:px-4 sm:py-2">
        <p className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
          {post.title}
        </p>
        {post.content && (
          <p className="mt-1.5 text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-sky-50/50 p-5 rounded-[2rem] border border-sky-100/50">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-sky-600" /> Ban tổ chức & Liên hệ
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
              <span className="font-semibold text-gray-700">{organizerName || "Chưa cập nhật"}</span>
            </div>
            {branch && (
              <div className="flex gap-3 text-gray-600">
                <MapPin size={16} className="text-sky-500 shrink-0" />
                <span>
                  {[branch.branchName, branch.address, branch.district, branch.city].filter(Boolean).join(", ")}
                  {courtName ? ` • ${courtName}` : ""}
                </span>
              </div>
            )}
            {contact?.phone && (
              <div className="flex gap-3 text-gray-600">
                <Phone size={16} className="text-sky-500 shrink-0" />
                <span>SĐT: {contact.phone}</span>
              </div>
            )}
            {contact?.email && (
              <div className="flex gap-3 text-gray-600">
                <Mail size={16} className="text-sky-500 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50/30 p-5 rounded-[2rem] border border-green-100/50">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-green-600" /> Timeline Sự Kiện
          </h4>
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-green-200">
            {(registration?.startDate || registration?.endDate) && (
              <div>
                <div className="absolute left-0 w-4 h-4 bg-white border-2 border-green-500 rounded-full z-10"></div>
                <p className="text-xs font-bold text-green-600 uppercase">Đăng ký:</p>
                <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                  <Calendar size={14} /> {[registration.startDate, registration.endDate].filter(Boolean).join(" - ")}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">OPEN</span>
              </div>
            )}
            {eventDate && (
              <div>
                <div className="absolute left-0 w-4 h-4 bg-white border-2 border-gray-300 rounded-full z-10"></div>
                <p className="text-xs font-bold text-gray-500 uppercase">Ngày sự kiện:</p>
                <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                  <Calendar size={14} /> {eventDate}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50/30 p-5 rounded-[2rem] border border-amber-100/50">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-tight">
            <Info size={18} className="text-amber-600" /> Thông tin Chi tiết
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div>
              <p className="text-gray-400 font-bold mb-1">Thể lệ Phí</p>
              <p className="font-bold text-gray-700">đăng ký</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold mb-1">Hạng mục</p>
              {categories && categories.length > 0 ? (
                <ul className="list-disc list-inside font-bold text-gray-700">
                  {categories.slice(0, 2).map((cat, i) => <li key={i}>{cat}</li>)}
                </ul>
              ) : (
                <p className="font-bold text-gray-700">Chưa cập nhật</p>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-amber-100">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Hình thức thanh toán</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                <CheckCircle2 size={14} /> Online/Offline
              </div>
              {contact?.inApp && (
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
                  <Smartphone size={14} /> Liên hệ trong app
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TournamentPost;