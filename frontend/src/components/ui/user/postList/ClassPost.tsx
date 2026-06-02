import { Calendar, Clock, MapPin, Users, DollarSign, Phone, MessageCircle, FileText } from "lucide-react";
import type { PostWithAuthor } from "../../../../types/post";
import { PLAYER_LEVEL_LABEL } from "../../../../utils/constants/profileConstant";
import ClassEnrollAction from "../coach/ClassEnrollAction";

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

const infoCard =
  "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5";

const ClassPost = ({ post, formData, branchInfo }: Props) => {
  const inputLevel = formData.inputLevel as string | undefined;
  const ageRange = formData.ageRange as string | undefined;
  const schedule = formData.schedule as
    | { weekdays?: number[]; startTime?: string; endTime?: string; startDate?: string }
    | undefined;
  const location = formData.location as { branchId?: number } | undefined;
  const maxStudents = formData.maxStudents as number | undefined;
  const tuitionFee = formData.tuitionFee as string | undefined;
  const contact = formData.contact as
    | { inAppChat?: boolean; phone?: string | null; zalo?: string | null }
    | undefined;
  const notes = formData.notes as string | null | undefined;

  const branch = location?.branchId ? branchInfo(location.branchId) : null;

  const getWeekdayNames = (weekdays: number[]) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return weekdays.map((day) => days[day]).join(", ");
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-700">
      <div className="border-b border-sky-100 bg-sky-50/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex min-w-0 flex-1 items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5 shrink-0 text-sky-600" />
            <span className="line-clamp-2">{post.title}</span>
          </h3>
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <ClassEnrollAction postId={post.id} compact />
          </div>
        </div>
        {post.content && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {post.content}
          </p>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {inputLevel && (
            <div className={infoCard}>
              <FileText className="h-5 w-5 shrink-0 text-sky-600" />
              <div>
                <p className="text-xs text-slate-500">Trình độ</p>
                <p className="font-medium text-slate-800">
                  {PLAYER_LEVEL_LABEL[inputLevel] ?? inputLevel}
                </p>
              </div>
            </div>
          )}

          {ageRange && (
            <div className={infoCard}>
              <Users className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-500">Độ tuổi</p>
                <p className="font-medium text-slate-800">{ageRange}</p>
              </div>
            </div>
          )}

          {schedule && (schedule.weekdays || schedule.startTime || schedule.endTime) && (
            <div className={infoCard}>
              <Calendar className="h-5 w-5 shrink-0 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Lịch học</p>
                <p className="font-medium text-slate-800">
                  {schedule.weekdays ? getWeekdayNames(schedule.weekdays) : ""}
                </p>
                <p className="text-sm text-slate-500">
                  {schedule.startTime && schedule.endTime
                    ? `${schedule.startTime} - ${schedule.endTime}`
                    : ""}
                </p>
              </div>
            </div>
          )}

          {schedule?.startDate && (
            <div className={infoCard}>
              <Clock className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs text-slate-500">Ngày bắt đầu</p>
                <p className="font-medium text-slate-800">
                  {new Date(schedule.startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          )}

          {branch && (
            <div className={infoCard}>
              <MapPin className="h-5 w-5 shrink-0 text-sky-600" />
              <div>
                <p className="text-xs text-slate-500">Địa điểm</p>
                <p className="font-medium text-slate-800">
                  {[branch.branchName, branch.address, branch.district, branch.province ?? branch.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {maxStudents && (
            <div className={infoCard}>
              <Users className="h-5 w-5 shrink-0 text-violet-500" />
              <div>
                <p className="text-xs text-slate-500">Số học viên tối đa</p>
                <p className="font-medium text-slate-800">{maxStudents} học viên</p>
              </div>
            </div>
          )}

          {tuitionFee && (
            <div className={infoCard}>
              <DollarSign className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-500">Học phí</p>
                <p className="font-medium text-slate-800">{tuitionFee}</p>
              </div>
            </div>
          )}
        </div>

        {(contact?.phone || contact?.zalo || contact?.inAppChat) && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <MessageCircle className="h-4 w-4 text-sky-600" />
              Thông tin liên hệ
            </h4>
            <div className="flex flex-wrap gap-3 text-sm">
              {contact.inAppChat && (
                <span className="inline-flex items-center gap-2 font-medium text-emerald-600">
                  <MessageCircle className="h-4 w-4" />
                  Chat trong app
                </span>
              )}
              {contact.phone && (
                <span className="inline-flex items-center gap-2 font-medium text-sky-700">
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </span>
              )}
              {contact.zalo && (
                <span className="inline-flex items-center gap-2 font-medium text-sky-600">
                  <MessageCircle className="h-4 w-4" />
                  Zalo: {contact.zalo}
                </span>
              )}
            </div>
          </div>
        )}

        {notes && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileText className="h-4 w-4 text-sky-600" />
              Ghi chú
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassPost;
