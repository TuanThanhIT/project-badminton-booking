import { Target, Eye, Heart, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect } from "react";
import { getCourtPrice } from "../../store/slices/customer/courtSlice";

interface CourtPrice {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  price: number;
  periodType: string;
}

const AboutPage = () => {
  const dispatch = useAppDispatch();
  const courtPrices = useAppSelector((state) => state.court.courtPrices);

  const columnHelper = createColumnHelper<CourtPrice>();

  useEffect(() => {
    dispatch(getCourtPrice());
  }, [dispatch]);

  const columns = [
    columnHelper.accessor("dayOfWeek", { header: "Thứ" }),
    columnHelper.accessor("startTime", { header: "Giờ bắt đầu" }),
    columnHelper.accessor("endTime", { header: "Giờ kết thúc" }),
    columnHelper.accessor("price", {
      header: "Giá sân",
      cell: (info) => info.getValue<number>().toLocaleString("vi-VN") + " ₫",
    }),
    columnHelper.accessor("periodType", { header: "Khung giờ" }),
  ];

  const table = useReactTable({
    data: courtPrices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-12">
      {/* Header / Banner */}
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-sky-700" />
        <h1 className="text-3xl font-bold text-sky-800 border-b-2">
          B-Hub | Đặt Sân & Mua Sắm Cầu Lông Chất Lượng
        </h1>
      </div>
      {/* Giới thiệu ngắn */}
      <section className="space-y-4">
        <p className="text-gray-700">
          B-Hub là cửa hàng cầu lông chuyên nghiệp, cung cấp dịch vụ đặt sân và
          bán các sản phẩm cầu lông chất lượng. Với đội ngũ tư vấn giàu kinh
          nghiệm, B-Hub cam kết mang đến trải nghiệm tốt nhất cho người yêu cầu
          lông.
        </p>
        <p className="text-gray-700">
          Chúng tôi cung cấp đa dạng các sản phẩm từ vợt, giày, balo, quần áo,
          phụ kiện… từ các thương hiệu nổi tiếng như Yonex, Victor, Lining,
          Mizuno, cũng như các dòng phổ thông phù hợp nhu cầu đa dạng.
        </p>
      </section>

      {/* Hình minh họa sản phẩm */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          <img
            src="/img/gioithieu7.jpg"
            alt="Shuttlecock close-up"
            className="w-full rounded-lg shadow-md"
          />
          <img
            src="/img/gioithieu3.jpg"
            alt="Shuttlecock close-up"
            className="w-full rounded-lg shadow-md"
          />
          <img
            src="/img/gioithieu6.jpg"
            alt="Shuttlecock close-up"
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div className="flex flex-col gap-5">
          <img
            src="/img/gioithieu1.jpg"
            alt="Người đánh cầu lông"
            className="w-full rounded-lg shadow-md"
          />
          <img
            src="/img/gioithieu8.jpg"
            alt="Người đánh cầu lông"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      </section>
      {/* Tầm nhìn & sứ mệnh */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-sky-600" />
          <h2 className="text-2xl font-semibold">Tầm nhìn & Sứ mệnh</h2>
        </div>
        <p className="text-gray-700">
          <strong>Tầm nhìn:</strong> Trở thành cửa hàng cầu lông hàng đầu, phục
          vụ nhu cầu chơi thể thao và nâng cao sức khỏe cộng đồng.
        </p>
        <p className="text-gray-700">
          <strong>Sứ mệnh:</strong> Cung cấp sản phẩm chất lượng, dịch vụ tận
          tâm và trải nghiệm chuyên nghiệp cho mọi khách hàng.
        </p>
      </section>
      {/* Giá trị cốt lõi */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-sky-600" />
          <h2 className="text-2xl font-semibold">Giá trị cốt lõi</h2>
        </div>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            <strong>Trung:</strong> Trung thực và minh bạch với khách hàng.
          </li>
          <li>
            <strong>Tín:</strong> Giữ chữ tín với sản phẩm và dịch vụ.
          </li>
          <li>
            <strong>Tâm:</strong> Luôn đặt lợi ích khách hàng lên hàng đầu.
          </li>
          <li>
            <strong>Trí:</strong> Sáng tạo và cải tiến để mang lại giá trị khác
            biệt.
          </li>
          <li>
            <strong>Nhân:</strong> Quan tâm đến nhân viên, khách hàng và cộng
            đồng.
          </li>
        </ul>
      </section>
      {/* Sự kiện & Giải đấu định kỳ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-600" />
          <h2 className="text-2xl font-semibold">Sự kiện & Giải đấu</h2>
        </div>
        <p className="text-gray-700">
          B-Hub tổ chức các giải đấu cầu lông định kỳ hàng tháng dành cho cả đơn
          nam, đơn nữ, đôi nam, đôi nữ và đôi nam nữ. Đây là cơ hội tuyệt vời để
          cộng đồng yêu cầu lông giao lưu, học hỏi kỹ thuật và trải nghiệm không
          khí thi đấu chuyên nghiệp.
        </p>
        <p className="text-gray-700">
          Các giải đấu đi kèm với những phần thưởng hấp dẫn và các quà tặng đặc
          biệt từ B-Hub. Mọi người đều được chào đón tham gia, từ người mới chơi
          đến những vận động viên có kinh nghiệm.
        </p>
        <img
          src="/img/gioithieu4.webp"
          alt="Badminton Tournament"
          className="w-full rounded-lg shadow-md"
        />
      </section>
      {/* Banner sản phẩm cuối */}
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
        <img
          src="/img/gioithieu5.jpg"
          alt="Racket & Shuttlecock"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Bảng giá đặt sân */}
      <section className="space-y-6">
        {/* Tiêu đề với icon */}
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-600" />
          <h2 className="text-2xl font-bold text-sky-800">Bảng giá đặt sân</h2>
        </div>

        {/* Bảng full-width */}
        <div className="w-full overflow-x-auto rounded-lg shadow-lg border">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <th
                      key={header.id}
                      className="border-b border-gray-200 p-4 text-left text-gray-700 font-semibold uppercase text-sm"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-sky-50 ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-gray-200 p-4 text-gray-700 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
