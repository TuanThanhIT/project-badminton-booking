import React from "react";
import {
  Target,
  Eye,
  Gem,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Smartphone,
  Users,
  ShoppingBag,
  CalendarCheck2,
  ArrowRight,
  Star,
  Sparkles,
  Trophy,
  RotateCcw,
  WalletCards,
  PackageCheck,
  ClipboardCheck,
  Clock3,
  Truck,
} from "lucide-react";

const AboutPage = () => {
  const bookingPolicies = [
    {
      icon: <CalendarCheck2 />,
      title: "Đặt sân tại BHub",
      points: [
        "Khách hàng chọn chi nhánh, sân, ngày chơi và khung giờ còn trống theo dữ liệu cập nhật trên hệ thống.",
        "Sau khi kiểm tra thông tin, khách có thể thanh toán bằng ví BHub, VNPay hoặc các phương thức được hỗ trợ.",
        "Lịch đặt chỉ được ghi nhận chính thức khi hệ thống xác nhận thanh toán hoặc xác nhận giữ chỗ theo trạng thái của đơn đặt sân.",
        "Khách có thể theo dõi lịch đã đặt, trạng thái thanh toán và thông tin sân trong khu vực lịch sử đặt sân.",
      ],
    },
    {
      icon: <RotateCcw />,
      title: "Hủy lịch đặt sân",
      points: [
        "Lịch đang chờ xác nhận có thể được khách hủy trực tiếp trên hệ thống mà không cần nhân viên duyệt.",
        "Lịch đã được xác nhận sẽ chuyển sang trạng thái yêu cầu hủy để nhân viên chi nhánh kiểm tra và xử lý.",
        "Nếu yêu cầu hủy được duyệt, lịch chuyển sang đã hủy và khoản tiền đủ điều kiện hoàn sẽ được cộng về ví BHub.",
        "Nếu yêu cầu hủy bị từ chối, lịch quay lại trạng thái trước đó và khách có thể xem lý do xử lý trên hệ thống.",
      ],
    },
  ];

  const orderPolicies = [
    {
      icon: <ShoppingBag />,
      title: "Đặt hàng sản phẩm",
      points: [
        "Khách chọn sản phẩm và đúng biến thể cần mua như màu sắc, kích thước, chất liệu và số lượng trước khi thanh toán.",
        "Hệ thống tính phí vận chuyển theo địa chỉ nhận hàng và chia đơn theo chi nhánh có tồn kho phù hợp.",
        "Đơn COD được chuyển cho nhân viên xử lý sau khi tạo đơn; đơn VNPay hoặc ví BHub chỉ được xử lý sau khi thanh toán thành công.",
        "Khách có thể theo dõi chi tiết từng đơn, sản phẩm, trạng thái vận chuyển và lịch sử giao hàng trong trang đơn hàng.",
      ],
    },
    {
      icon: <PackageCheck />,
      title: "Hủy đơn hàng",
      points: [
        "Đơn đang chờ xử lý có thể được khách hủy trực tiếp, hệ thống chuyển đơn sang đã hủy và hoàn tiền về ví nếu đơn đã thanh toán.",
        "Đơn đã xác nhận, đang chuẩn bị, sẵn sàng giao, đang giao hoặc giao thất bại sẽ được gửi thành yêu cầu hủy cho nhân viên.",
        "Nếu đơn chưa tạo vận đơn hoặc GHN còn ở giai đoạn mới tạo/lấy hàng, nhân viên có thể duyệt hủy và hệ thống hoàn tiền nếu đủ điều kiện.",
        "Nếu hàng đã rời shop và đang giao, nhân viên sẽ từ chối hủy; khách có thể nhận hàng rồi gửi yêu cầu trả hàng nếu cần.",
      ],
    },
    {
      icon: <Truck />,
      title: "Trả hàng và hoàn hàng",
      points: [
        "Khách chỉ gửi yêu cầu trả hàng khi đơn đã hoàn thành và trạng thái giao hàng là đã giao thành công.",
        "Sau khi khách gửi lý do trả hàng, đơn chuyển sang yêu cầu trả hàng để nhân viên chi nhánh xem xét.",
        "Khi nhân viên duyệt, đơn chuyển sang đang hoàn hàng; khoản tiền chưa được hoàn ngay cho đến khi shop nhận lại hàng.",
        "Khi shop xác nhận đã nhận hàng hoàn, đơn chuyển sang đã hoàn hàng và hệ thống hoàn khoản tiền đủ điều kiện vào ví BHub.",
      ],
    },
  ];

  const refundNotes = [
    "BHub hoàn tiền vào ví BHub của khách hàng đối với các giao dịch đã thanh toán thành công và đủ điều kiện hoàn.",
    "Đơn COD hoặc giao dịch chưa ghi nhận thanh toán thành công sẽ không phát sinh hoàn ví tự động.",
    "Số tiền hoàn được tính theo giá trị đơn liên quan, có phân bổ phần giảm giá nếu đơn thuộc một nhóm đơn có mã khuyến mãi.",
    "Các yêu cầu hủy/trả hàng cần có lý do rõ ràng để nhân viên chi nhánh kiểm tra và phản hồi minh bạch.",
  ];

  return (
    <div className="bg-white text-slate-800 font-sans overflow-hidden">
      {/* HERO */}
      <section className="relative bg-sky-950 py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_35%)]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-10 right-20 w-72 h-72 border border-white rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sky-100 text-sm font-semibold mb-6">
                <Sparkles size={16} className="text-sky-300" />
                Nền tảng thể thao All-in-one
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Nâng Tầm Trải Nghiệm{" "}
                <span className="text-sky-400">Cầu Lông</span>
              </h1>

              <p className="text-lg md:text-xl text-sky-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                B-Hub không chỉ là ứng dụng đặt sân. Đây là hệ sinh thái giúp
                người chơi đặt sân, mua sắm dụng cụ, thanh toán và quản lý lịch
                chơi nhanh chóng hơn.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <button className="group bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-sky-900/30 flex items-center justify-center gap-2">
                  Khám phá ngay
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <button className="bg-white/10 border border-white/20 text-sky-50 hover:bg-white/15 px-8 py-4 rounded-full font-bold transition-all">
                  Tìm hiểu thêm
                </button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                {[
                  ["10+", "Chi nhánh"],
                  ["50+", "Sân"],
                  ["24/7", "Hỗ trợ"],
                ].map(([num, label]) => (
                  <div
                    key={label}
                    className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
                  >
                    <p className="text-2xl font-extrabold text-white">{num}</p>
                    <p className="text-xs text-sky-200 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-sky-400/20 blur-3xl rounded-full" />

              <div className="relative bg-white/10 border border-white/15 rounded-[2.5rem] p-5 backdrop-blur-md shadow-2xl">
                <img
                  src="./img/introduce.jpg"
                  alt="Badminton Court"
                  className="w-full h-[420px] object-cover rounded-[2rem]"
                />

                <div className="absolute -bottom-6 left-8 right-8 bg-white rounded-3xl p-5 shadow-2xl border border-sky-50">
                  <div className="flex items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Zap size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">
                          Real-time Booking
                        </p>
                        <p className="text-lg font-extrabold text-slate-900">
                          Cập nhật nhanh chóng
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={18} fill="currentColor" />
                      <span className="font-bold text-slate-800">4.9</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 top-14 bg-white rounded-2xl p-4 shadow-xl border border-sky-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Trạng thái</p>
                    <p className="text-sm font-bold text-slate-800">
                      Sân còn trống
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-sky-100 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-100 rounded-full blur-2xl" />

            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-sky-50">
              <img
                src="./img/about-us3.avif"
                alt="Badminton"
                className="w-full h-[470px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/60 via-transparent to-transparent" />

              <div className="absolute left-6 bottom-6 bg-white/95 backdrop-blur-sm p-5 rounded-3xl shadow-xl max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Trophy size={23} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Mục tiêu</p>
                    <p className="font-extrabold text-slate-900">
                      Chơi dễ hơn mỗi ngày
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tối ưu toàn bộ hành trình từ tìm sân, đặt lịch đến thanh toán.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-sky-600 mb-3 uppercase tracking-widest">
              Câu chuyện B-Hub
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Giải pháp chuyển đổi số toàn diện cho cộng đồng cầu lông
            </h2>

            <p className="text-slate-600 mb-5 leading-relaxed">
              B-Hub ra đời từ những bất cập quen thuộc: đặt sân thủ công, dễ
              trùng lịch, khó kiểm tra sân trống và thiếu một nơi mua sắm dụng
              cụ cầu lông đáng tin cậy.
            </p>

            <p className="text-slate-600 mb-8 leading-relaxed">
              Với định hướng All-in-one, B-Hub giúp người chơi thao tác nhanh,
              chủ sân quản lý hiệu quả hơn và toàn bộ trải nghiệm trở nên minh
              bạch, hiện đại, tiện lợi.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Đặt sân theo thời gian thực",
                "Thanh toán nhanh và linh hoạt",
                "Quản lý lịch chơi cá nhân",
                "Mua sắm dụng cụ chính hãng",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-slate-50 hover:bg-sky-50 border border-slate-100 rounded-2xl p-4 transition-all"
                >
                  <CheckCircle2 className="text-sky-500 shrink-0" size={21} />
                  <span className="font-semibold text-slate-700 text-sm">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="relative bg-slate-50 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-3">
              Định hướng phát triển
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Điều B-Hub theo đuổi
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target />,
                title: "Sứ mệnh",
                desc: "Số hóa quy trình vận hành sân bãi, giúp người chơi tiết kiệm thời gian và tiếp cận thể thao dễ dàng hơn.",
                bg: "bg-sky-50",
                color: "text-sky-600",
              },
              {
                icon: <Eye />,
                title: "Tầm nhìn",
                desc: "Trở thành hệ sinh thái thể thao trực tuyến quen thuộc, nơi người chơi tìm thấy mọi thứ chỉ trong một nền tảng.",
                bg: "bg-indigo-50",
                color: "text-indigo-600",
              },
              {
                icon: <Gem />,
                title: "Giá trị cốt lõi",
                desc: "Uy tín, chất lượng, công nghệ và sự hài lòng của khách hàng là nền tảng cho mọi dịch vụ tại B-Hub.",
                bg: "bg-amber-50",
                color: "text-amber-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group bg-white p-9 rounded-[2rem] shadow-[0_10px_35px_rgba(15,23,42,0.04)] border border-slate-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-15 h-15 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  {React.cloneElement(item.icon, { size: 32 })}
                </div>

                <h3 className="text-xl font-extrabold mb-4 text-slate-900">
                  {item.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-3">
              Tính năng nổi bật
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Mọi dịch vụ trong một nền tảng
            </h2>
          </div>

          <p className="text-slate-500 max-w-xl leading-relaxed">
            B-Hub gom những thao tác thường ngày của người chơi cầu lông vào một
            trải nghiệm rõ ràng, nhanh và dễ sử dụng.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <CalendarCheck2 />,
              title: "Đặt sân thông minh",
              desc: "Xem sân trống, chọn giờ, đặt lịch và giữ sân nhanh chóng.",
            },
            {
              icon: <ShoppingBag />,
              title: "Cửa hàng thể thao",
              desc: "Mua vợt, cầu, phụ kiện và sản phẩm thể thao chính hãng.",
            },
            {
              icon: <ShieldCheck />,
              title: "Thanh toán an toàn",
              desc: "Hỗ trợ nhiều phương thức thanh toán tiện lợi và minh bạch.",
            },
            {
              icon: <Smartphone />,
              title: "Quản lý cá nhân",
              desc: "Theo dõi lịch đặt sân, đơn hàng và thông báo trong tài khoản.",
            },
          ].map((service, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-[2rem] border border-slate-100 bg-white hover:bg-sky-950 transition-all duration-300 shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-xl overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-28 h-28 bg-sky-400/10 rounded-full group-hover:bg-sky-400/20 transition-all" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-white/10 group-hover:text-sky-300 flex items-center justify-center mb-6 transition-all">
                  {React.cloneElement(service.icon, { size: 30 })}
                </div>

                <h3 className="text-lg font-extrabold mb-3 text-slate-900 group-hover:text-white transition-colors">
                  {service.title}
                </h3>

                <p className="text-slate-500 text-sm group-hover:text-sky-100 transition-colors leading-relaxed">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POLICY */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-3">
                Chính sách dịch vụ BHub
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Đặt sân, đặt hàng, hủy đơn và hoàn tiền minh bạch
              </h2>
            </div>

            <p className="text-slate-500 max-w-2xl leading-relaxed">
              BHub công khai quy trình xử lý để khách hàng chủ động theo dõi
              từng trạng thái. Mỗi thao tác hủy, trả hàng hoặc hoàn tiền đều
              được ghi nhận trên hệ thống và chuyển đến đúng chi nhánh phụ
              trách.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {bookingPolicies.map((policy) => (
              <div
                key={policy.title}
                className="rounded-[2rem] border border-sky-100 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    {React.cloneElement(policy.icon, { size: 26 })}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {policy.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {policy.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-sky-500"
                      />
                      <p className="text-sm leading-relaxed text-slate-600">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {orderPolicies.map((policy) => (
              <div
                key={policy.title}
                className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    {React.cloneElement(policy.icon, { size: 26 })}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {policy.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {policy.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-indigo-500"
                      />
                      <p className="text-sm leading-relaxed text-slate-600">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="bg-sky-950 p-8 text-white">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                  <WalletCards size={28} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-sky-200">
                  Chính sách hoàn tiền
                </p>
                <h3 className="mt-3 text-2xl font-extrabold leading-tight">
                  Tiền hoàn được cộng về ví BHub khi đủ điều kiện
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-sky-100">
                  Ví BHub giúp khách nhận lại khoản hoàn minh bạch, dễ kiểm
                  tra và có thể sử dụng cho những lần đặt sân hoặc mua hàng
                  tiếp theo.
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {refundNotes.map((note, index) => (
                  <div
                    key={note}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                      {index === 0 && <WalletCards size={18} />}
                      {index === 1 && <ClipboardCheck size={18} />}
                      {index === 2 && <Clock3 size={18} />}
                      {index === 3 && <ShieldCheck size={18} />}
                      Lưu ý {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="relative bg-sky-950 rounded-[3rem] p-10 md:p-14 text-white overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              ["10+", "Chi nhánh"],
              ["50+", "Sân cầu lông"],
              ["1.000+", "Khách hàng"],
              ["24/7", "Hỗ trợ"],
            ].map(([num, label]) => (
              <div
                key={label}
                className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
              >
                <p className="text-4xl font-extrabold mb-2 text-sky-300">
                  {num}
                </p>
                <p className="text-sky-100 uppercase tracking-widest text-xs font-bold">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 md:p-14 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl mb-7">
              <Users size={32} />
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold mb-5 text-slate-900">
              Bạn đã sẵn sàng ra sân chưa?
            </h2>

            <p className="text-slate-600 mb-9 text-lg leading-relaxed max-w-2xl mx-auto">
              Đừng để việc tìm sân làm gián đoạn niềm đam mê. Hãy để B-Hub đồng
              hành cùng bạn trong mọi trận đấu.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-sky-600 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all hover:-translate-y-1">
                Đặt sân ngay bây giờ
              </button>

              <button className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                <Users size={20} />
                Tìm đối giao lưu
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
