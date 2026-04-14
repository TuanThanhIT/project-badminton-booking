import { Calendar, Clock, MapPin, Users, DollarSign, Phone, MessageCircle, FileText } from 'lucide-react';
import type { PostWithAuthor } from '../../../../types/post';

type Props = {
  post: PostWithAuthor;
  formData: Record<string, unknown>;
  branchInfo: (branchId?: number) => { branchName: string; address?: string; district?: string; city?: string } | null;
};

const ClassPost = ({ post, formData, branchInfo }: Props) => {
  // Parse formData
  const inputLevel = formData.inputLevel as string | undefined;
  const ageRange = formData.ageRange as string | undefined;
  const schedule = formData.schedule as { weekdays?: number[]; startTime?: string; endTime?: string; startDate?: string } | undefined;
  const location = formData.location as { branchId?: number } | undefined;
  const maxStudents = formData.maxStudents as number | undefined;
  const tuitionFee = formData.tuitionFee as string | undefined;
  const contact = formData.contact as { inAppChat?: boolean; phone?: string | null; zalo?: string | null } | undefined;
  const notes = formData.notes as string | null | undefined;

  // Get branch info
  const branch = location?.branchId ? branchInfo(location.branchId) : null;

  const getWeekdayNames = (weekdays: number[]) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return weekdays.map(day => days[day]).join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          {post.title}
        </h3>
        {post.content && (
          <p className="text-blue-100 text-sm mt-1 line-clamp-2">{post.content}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Grid thông tin chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Trình độ */}
          {inputLevel && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trình độ</p>
                <p className="font-semibold text-gray-800">{inputLevel}</p>
              </div>
            </div>
          )}

          {/* Độ tuổi */}
          {ageRange && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Độ tuổi</p>
                <p className="font-semibold text-gray-800">{ageRange}</p>
              </div>
            </div>
          )}

          {/* Lịch học */}
          {schedule && (schedule.weekdays || schedule.startTime || schedule.endTime) && (
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lịch học</p>
                <p className="font-semibold text-gray-800">
                  {schedule.weekdays ? getWeekdayNames(schedule.weekdays) : ''}
                </p>
                <p className="text-sm text-gray-600">
                  {schedule.startTime && schedule.endTime ? `${schedule.startTime} - ${schedule.endTime}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Ngày bắt đầu */}
          {schedule?.startDate && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="bg-orange-100 p-2 rounded-full">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                <p className="font-semibold text-gray-800">
                  {new Date(schedule.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          )}

          {/* Địa điểm */}
          {branch && (
            <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
              <div className="bg-cyan-100 p-2 rounded-full">
                <MapPin className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa điểm</p>
                <p className="font-semibold text-gray-800">
                  {[branch.branchName, branch.address, branch.district, branch.city]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Số học viên tối đa */}
          {maxStudents && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <div className="bg-indigo-100 p-2 rounded-full">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số học viên tối đa</p>
                <p className="font-semibold text-gray-800">{maxStudents} học viên</p>
              </div>
            </div>
          )}

          {/* Học phí */}
          {tuitionFee && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="bg-yellow-100 p-2 rounded-full">
                <DollarSign className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Học phí</p>
                <p className="font-semibold text-gray-800">{tuitionFee}</p>
              </div>
            </div>
          )}
        </div>

        {/* Thông tin liên hệ */}
        {(contact?.phone || contact?.zalo || contact?.inAppChat) && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contact.inAppChat && (
                <div className="flex items-center gap-2 text-green-600">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Chat trong app</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
              )}
              {contact.zalo && (
                <div className="flex items-center gap-2 text-blue-500">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Zalo: {contact.zalo}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ghi chú */}
        {notes && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ghi chú
            </h4>
            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
              {notes}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
          <Users className="w-4 h-4" />
          Đăng ký học
        </button>
      </div>
    </div>
  );
};

export default ClassPost;