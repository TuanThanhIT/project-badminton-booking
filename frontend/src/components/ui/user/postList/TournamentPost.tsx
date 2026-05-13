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
  courtNameById: Record<number, string>;
};

const TournamentPost = ({ post, formData, branchInfo, courtNameById }: Props) => {
  const organizerName = formData.organizerName as string | undefined;
  const location = formData.location as
    | { branchId?: number; courtId?: number }
    | undefined;
  const registration = formData.registration as
    | { startDate?: string; endDate?: string }
    | undefined;
  const eventDate = formData.eventDate as string | undefined;
  const categories = formData.categories as string[] | undefined;
  const contact = formData.contact as
    | { phone?: string | null; email?: string | null; inApp?: boolean }
    | undefined;

  const branch = location?.branchId ? branchInfo(location.branchId) : null;
  const courtName = location?.courtId
    ? courtNameById[location.courtId] || `Sân ${location.courtId}`
    : "";

  return (
    <div className="text-slate-700">
      <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-lg font-semibold leading-snug text-slate-900">
          {post.title}
        </p>
        {post.content && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {post.content}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Users size={18} className="text-sky-600" />
            Ban tổ chức & liên hệ
          </h4>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="shrink-0 text-sky-500" />
              <span className="font-medium text-slate-800">
                {organizerName || "Chưa cập nhật"}
              </span>
            </div>
            {branch && (
              <div className="flex gap-3">
                <MapPin size={16} className="shrink-0 text-sky-500" />
                <span>
                  {[branch.branchName, branch.address, branch.district, branch.province ?? branch.city]
                    .filter(Boolean)
                    .join(", ")}
                  {courtName ? ` • ${courtName}` : ""}
                </span>
              </div>
            )}
            {contact?.phone && (
              <div className="flex gap-3">
                <Phone size={16} className="shrink-0 text-sky-500" />
                <span>SĐT: {contact.phone}</span>
              </div>
            )}
            {contact?.email && (
              <div className="flex gap-3">
                <Mail size={16} className="shrink-0 text-sky-500" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Clock size={18} className="text-emerald-600" />
            Timeline sự kiện
          </h4>
          <div className="space-y-4 text-sm">
            {(registration?.startDate || registration?.endDate) && (
              <div className="rounded-2xl bg-emerald-50/70 p-3">
                <p className="text-xs font-medium text-emerald-700">Đăng ký</p>
                <div className="mt-1 flex items-center gap-1 text-slate-700">
                  <Calendar size={14} />
                  {[registration.startDate, registration.endDate]
                    .filter(Boolean)
                    .join(" - ")}
                </div>
              </div>
            )}
            {eventDate && (
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Ngày sự kiện</p>
                <div className="mt-1 flex items-center gap-1 text-slate-700">
                  <Calendar size={14} />
                  {eventDate}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Info size={18} className="text-amber-600" />
            Thông tin chi tiết
          </h4>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">Hạng mục</p>
              {categories && categories.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((cat, index) => (
                    <span
                      key={`${cat}-${index}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 font-medium text-slate-800">Chưa cập nhật</p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs text-slate-500">Hình thức thanh toán</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 size={14} /> Online/Offline
                </div>
                {contact?.inApp && (
                  <div className="flex items-center gap-2 text-sm font-medium text-sky-600">
                    <Smartphone size={14} /> Liên hệ trong app
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentPost;
