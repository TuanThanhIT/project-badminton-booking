import { Calendar, MapPin, Users, Target, MessageCircle, ExternalLink } from "lucide-react";
import type { PostWithAuthor } from "../../../../types/post";
import { PLAYER_LEVEL_LABEL } from "../../../../utils/constants/profileConstant";
import { formatTimeRange } from "../../../../utils/booking";

type Props = {
  post: PostWithAuthor;
  formData: Record<string, unknown>;
};

const GroupPost = ({ post, formData }: Props) => {
  const area = formData.area as { city?: string; district?: string } | undefined;
  const weeklySchedule = formData.weeklySchedule as
    | { weekdays?: number[]; startTime?: string; endTime?: string }
    | undefined;
  const levelWanted = formData.levelWanted as string | undefined;
  const contact = formData.contact as
    | { inApp?: boolean; zaloGroupLink?: string }
    | undefined;

  const getWeekdayNames = (weekdays: number[]) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return weekdays.map((day) => days[day]).join(", ");
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-slate-700">
      <div className="border-b border-emerald-100 bg-emerald-50/80 p-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Users className="h-5 w-5 text-emerald-600" />
          {post.title}
        </h3>
        {post.content && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {post.content}
          </p>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {area && (area.district || area.city) && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
              <MapPin className="h-5 w-5 shrink-0 text-sky-600" />
              <div>
                <p className="text-xs text-slate-500">Khu vực</p>
                <p className="font-medium text-slate-800">
                  {[area.district, area.city].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          )}

          {weeklySchedule &&
            (weeklySchedule.weekdays ||
              weeklySchedule.startTime ||
              weeklySchedule.endTime) && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <Calendar className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs text-slate-500">Lịch chơi</p>
                  <p className="font-medium text-slate-800">
                    {weeklySchedule.weekdays
                      ? getWeekdayNames(weeklySchedule.weekdays)
                      : ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    {weeklySchedule.startTime && weeklySchedule.endTime
                      ? formatTimeRange(
                          weeklySchedule.startTime,
                          weeklySchedule.endTime,
                        )
                      : ""}
                  </p>
                </div>
              </div>
            )}

          {levelWanted && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 md:col-span-2">
              <Target className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs text-slate-500">Trình độ mong muốn</p>
                <p className="font-medium text-slate-800">
                  {PLAYER_LEVEL_LABEL[levelWanted] ?? levelWanted}
                </p>
              </div>
            </div>
          )}
        </div>

        {(contact?.inApp || contact?.zaloGroupLink) && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <MessageCircle className="h-4 w-4 text-sky-600" />
              Thông tin liên hệ
            </h4>
            <div className="flex flex-wrap gap-3 text-sm">
              {contact.inApp && (
                <span className="inline-flex items-center gap-2 font-medium text-emerald-600">
                  <MessageCircle className="h-4 w-4" />
                  Chat trong app
                </span>
              )}
              {contact.zaloGroupLink && (
                <a
                  href={contact.zaloGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-sky-700 hover:text-sky-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Tham gia nhóm Zalo
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPost;
