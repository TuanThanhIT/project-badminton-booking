import { Calendar, MapPin, Users, Target, MessageCircle, ExternalLink } from 'lucide-react';
import type { PostWithAuthor } from '../../../../types/post';
import { PLAYER_LEVEL_LABEL } from '../../../../constants/profileConstant';

type Props = {
  post: PostWithAuthor;
  formData: Record<string, unknown>;
};

const GroupPost = ({ post, formData }: Props) => {
  // Parse formData
  const area = formData.area as { city?: string; district?: string } | undefined;
  const weeklySchedule = formData.weeklySchedule as { weekdays?: number[]; startTime?: string; endTime?: string } | undefined;
  const levelWanted = formData.levelWanted as string | undefined;
  const contact = formData.contact as { inApp?: boolean; zaloGroupLink?: string } | undefined;

  const getWeekdayNames = (weekdays: number[]) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return weekdays.map(day => days[day]).join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          {post.title}
        </h3>
        {post.content && (
          <p className="text-purple-100 text-sm mt-1 line-clamp-2">{post.content}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Grid thông tin chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Khu vực */}
          {area && (area.district || area.city) && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Khu vực</p>
                <p className="font-semibold text-gray-800">
                  {[area.district, area.city].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Lịch chơi */}
          {weeklySchedule && (weeklySchedule.weekdays || weeklySchedule.startTime || weeklySchedule.endTime) && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lịch chơi</p>
                <p className="font-semibold text-gray-800">
                  {weeklySchedule.weekdays ? getWeekdayNames(weeklySchedule.weekdays) : ''}
                </p>
                <p className="text-sm text-gray-600">
                  {weeklySchedule.startTime && weeklySchedule.endTime ? `${weeklySchedule.startTime} - ${weeklySchedule.endTime}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Trình độ mong muốn */}
          {levelWanted && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg md:col-span-2">
              <div className="bg-orange-100 p-2 rounded-full">
                <Target className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trình độ mong muốn</p>
                <p className="font-semibold text-gray-800">{PLAYER_LEVEL_LABEL[levelWanted] ?? levelWanted}</p>
              </div>
            </div>
          )}
        </div>

        {/* Thông tin liên hệ */}
        {(contact?.inApp || contact?.zaloGroupLink) && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contact.inApp && (
                <div className="flex items-center gap-2 text-green-600">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Chat trong app</span>
                </div>
              )}
              {contact.zaloGroupLink && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  <a
                    href={contact.zaloGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Tham gia nhóm Zalo
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
          <Users className="w-4 h-4" />
          Tham gia nhóm
        </button>
      </div>
    </div>
  );
};

export default GroupPost;