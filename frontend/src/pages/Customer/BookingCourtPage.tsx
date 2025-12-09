import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  clearCourtError,
  getCourts,
} from "../../store/slices/customer/courtSlice";
import { toast } from "react-toastify";
import { Calendar, Loader2 } from "lucide-react";
import type { CourtListRequest } from "../../types/court";
import PaginatedItems from "../../components/ui/PaginatedItems";
import WeekDateSelector from "../../components/ui/WeekDateSelector";
import { useNavigate } from "react-router-dom";

const BookingCourtPage = () => {
  const dispatch = useAppDispatch();
  const { courts, loading, error } = useAppSelector((state) => state.court);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const limit = 8;
  const [date, setDate] = useState(() => {
    return localStorage.getItem("selectedBookingDate") || "";
  });

  const [weekDay, setWeekday] = useState(() => {
    return localStorage.getItem("selectedBookingWeekday") || "";
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCourtError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const data: CourtListRequest = { page, limit, date };
    dispatch(getCourts({ data }));
  }, [dispatch, page, date]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-sky-700">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-lg font-semibold">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-sky-600" />
          <h1 className="text-3xl font-bold text-sky-800 border-b-2">
            Đặt sân
          </h1>
        </div>

        <WeekDateSelector
          setWeekday={setWeekday}
          selectedDate={date}
          onChange={setDate}
        />

        {/* DANH SÁCH COURTS */}
        {courts && courts.courts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {courts.courts.map((court) => {
              const isAvailable = court.availableSlots > 0;

              return (
                <div
                  key={court.id}
                  className="bg-white border border-gray-200 rounded-2xl group hover:shadow-lg transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col relative"
                >
                  {/* Badge tình trạng sân */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold shadow-md z-10 transition-all duration-300 ${
                      isAvailable
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                    }`}
                  >
                    {isAvailable ? "Sẵn sàng" : "Hết"}
                  </div>

                  {/* Hình ảnh sân */}
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={court.thumbnailUrl}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Nội dung */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sky-600 line-clamp-2">
                        {court.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Vị trí: </span>
                        {court.location}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Ngày:</span> {court.date}
                      </p>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        <span className="font-medium">Số khung giờ trống:</span>{" "}
                        {court.availableSlots} khung giờ
                      </p>
                    </div>

                    <button
                      disabled={!isAvailable}
                      className={`mt-4 w-full px-4 py-2 rounded-xl font-semibold transition-colors duration-200 ${
                        isAvailable
                          ? "bg-sky-600 text-white hover:bg-sky-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        navigate(
                          `/booking/${court.id}?date=${court.date}&weekday=${weekDay}`
                        )
                      }
                    >
                      Đặt sân
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center mt-4 text-gray-500 text-lg">
            Chưa có dữ liệu sân.
          </p>
        )}

        {/* Pagination server-side */}
        {courts && courts.total > limit && (
          <PaginatedItems
            total={courts.total ?? 0}
            limit={courts.limit ?? limit}
            page={courts.page ?? 1}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
};

export default BookingCourtPage;
