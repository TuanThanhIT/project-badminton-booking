import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  Clock,
  Facebook,
  FileText,
  HeadphonesIcon,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
  Youtube,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getPagedBranches } from "../../redux/slices/user/branchSlice";
import type { Branch } from "../../types/branch";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-sky-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-100";

const labelClass = "text-sm font-semibold text-slate-700";

const supportCards = [
  {
    icon: Building2,
    title: "Hệ thống chi nhánh",
    content: "Nhiều sân B-Hub tại TP.HCM",
    subContent: "Chọn chi nhánh bên dưới để xem bản đồ",
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    icon: Phone,
    title: "Hotline chung",
    content: "0901 234 567",
    subContent: "Hỗ trợ đặt sân và mua hàng",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Mail,
    title: "Email",
    content: "support@bhub.vn",
    subContent: "info@bhub.vn",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Clock,
    title: "Giờ hỗ trợ",
    content: "06:00 - 23:00",
    subContent: "Tất cả các ngày trong tuần",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const getBranchAddress = (branch?: Branch | null) => {
  if (!branch) return "";
  return (
    branch.fullAddress ||
    [branch.address, branch.wardName, branch.districtName, branch.provinceName]
      .filter(Boolean)
      .join(", ")
  );
};

const ContactPage = () => {
  const dispatch = useAppDispatch();
  const branches = useAppSelector(
    (state) => state.branch.pagedBranch?.branches,
  );
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getPagedBranches({ data: { page: 1, limit: 12 } }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedBranchId && branches?.length) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const selectedBranch = useMemo(
    () =>
      branches?.find((branch) => branch.id === selectedBranchId) ||
      branches?.[0] ||
      null,
    [branches, selectedBranchId],
  );

  const mapQuery = selectedBranch
    ? selectedBranch.latitude && selectedBranch.longitude
      ? `${selectedBranch.latitude},${selectedBranch.longitude}`
      : getBranchAddress(selectedBranch)
    : "B-Hub badminton";

  return (
    <div className="bg-white font-sans text-slate-800">
      <section className="relative overflow-hidden bg-sky-950 py-20 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />
        <div className="absolute right-0 top-0 h-full w-1/3 translate-x-20 skew-x-12 bg-sky-800/30" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:text-left">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="lg:w-1/2">
              <span className="mb-5 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
                Trung tâm hỗ trợ B-Hub
              </span>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
                Kết nối với <span className="text-sky-300">B-Hub</span>
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-sky-100 sm:text-xl">
                Một kênh liên hệ cho toàn bộ hệ thống chi nhánh. Chọn cửa hàng
                gần bạn để xem bản đồ, hoặc gửi yêu cầu để B-Hub điều phối hỗ
                trợ phù hợp.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sky-100">
                  <HeadphonesIcon size={18} />
                  <span className="text-sm">Hỗ trợ trực tuyến 24/7</span>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sky-100">
                  <MessageSquare size={18} />
                  <span className="text-sm">Điều phối theo chi nhánh</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:w-1/3">
              <div className="relative">
                <div className="absolute inset-0 scale-105 rounded-[2rem] bg-sky-400/20 blur-2xl" />
                <div className="relative rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                  <img
                    src="./img/contact.jpg"
                    alt="B-Hub support"
                    className="h-80 w-full rounded-[1.5rem] object-cover"
                  />
                  <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-sky-100 bg-white p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900">
                      B-Hub Care
                    </p>
                    <p className="text-xs text-slate-500">
                      Một kênh hỗ trợ cho toàn bộ hệ thống chi nhánh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-14 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {supportCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-[0_18px_45px_rgba(14,165,233,0.14)] sm:p-7"
              >
                <div
                  className={`${item.bg} ${item.color} mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105`}
                >
                  <Icon size={28} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-slate-700">
                  {item.content}
                </p>
                <p className="mt-1 text-xs text-slate-500">{item.subContent}</p>
              </div>
            );
          })}
        </div>

        <div className="relative py-14 sm:py-16 lg:py-20">
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-sky-50/80 via-white to-white" />

          <div className="relative z-10 space-y-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.09)]">
                  <div className="absolute left-0 right-0 top-0 h-[4px] bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500" />

                  <div className="p-5 sm:p-8 md:p-10">
                    <div className="mb-8 flex items-start justify-between gap-5">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-sky-600">
                          Liên hệ tư vấn
                        </p>
                        <h2 className="mb-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                          Gửi tin nhắn cho chúng tôi
                        </h2>
                        <p className="leading-relaxed text-slate-600">
                          Chọn vấn đề cần hỗ trợ, B-Hub sẽ điều phối đến bộ phận
                          hoặc chi nhánh phù hợp.
                        </p>
                      </div>

                      <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600 shadow-sm md:flex">
                        <Send size={26} />
                      </div>
                    </div>

                    <form className="space-y-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className={labelClass}>Họ và tên</label>
                          <div className="relative">
                            <User
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="text"
                              placeholder="Nguyễn Văn A"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={labelClass}>Số điện thoại</label>
                          <div className="relative">
                            <Phone
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="text"
                              placeholder="09xx xxx xxx"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>Email</label>
                        <div className="relative">
                          <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="email"
                            placeholder="example@gmail.com"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>Vấn đề cần hỗ trợ</label>
                        <div className="relative">
                          <MessageSquare
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <select
                            className={`${inputClass} cursor-pointer appearance-none pr-12`}
                          >
                            <option>Đặt sân cầu lông</option>
                            <option>Tư vấn mua dụng cụ</option>
                            <option>Hỗ trợ chi nhánh cụ thể</option>
                            <option>Hợp tác kinh doanh</option>
                            <option>Góp ý dịch vụ</option>
                          </select>
                          <ChevronDown
                            size={20}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>Nội dung chi tiết</label>
                        <div className="relative">
                          <FileText
                            size={18}
                            className="absolute left-4 top-5 text-slate-400"
                          />
                          <textarea
                            rows={5}
                            placeholder="Nhập nội dung bạn cần hỗ trợ..."
                            className={`${inputClass} resize-none leading-relaxed`}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-sky-500 py-4 font-semibold text-white shadow-lg shadow-sky-100 transition-all duration-300 hover:bg-sky-600 hover:shadow-sky-200 active:scale-[0.98]"
                      >
                        <Send
                          size={20}
                          className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                        />
                        Gửi liên hệ ngay
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative flex h-full min-h-[320px] overflow-hidden rounded-[2rem] bg-sky-950 p-7 text-white shadow-[0_14px_45px_rgba(15,23,42,0.14)] sm:p-9">
                  <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-400/20 blur-2xl" />
                  <div className="relative z-10 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold">Theo dõi B-Hub</h3>
                      <p className="mt-4 text-sm leading-relaxed text-sky-100">
                        Cập nhật tin tức về chi nhánh, giải đấu, ưu đãi sân và
                        sản phẩm cầu lông mới. B-Hub gom mọi thông báo quan
                        trọng ở các kênh mạng xã hội chính thức.
                      </p>
                    </div>

                    <div className="mt-8 flex gap-4">
                      {[Facebook, Instagram, Youtube].map((Icon, index) => (
                        <a
                          key={index}
                          href="#"
                          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition-all hover:-translate-y-1 hover:bg-sky-500"
                        >
                          <Icon size={23} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.09)]">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-sky-600">
                    Chi nhánh B-Hub
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                    Hệ thống cửa hàng và bản đồ
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                    Cột trái là danh sách cửa hàng, cột phải là bản đồ của chi
                    nhánh đang chọn.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
                  {branches?.length || 0} chi nhánh
                </span>
              </div>

              <div className="grid lg:grid-cols-[380px_minmax(0,1fr)]">
                <div className="border-b border-slate-200 bg-slate-50/80 p-5 lg:border-b-0 lg:border-r">
                  <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                    {branches?.length ? (
                      branches.map((branch) => {
                        const active = selectedBranch?.id === branch.id;
                        return (
                          <button
                            key={branch.id}
                            type="button"
                            onClick={() => setSelectedBranchId(branch.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${
                              active
                                ? "border-sky-300 bg-white text-sky-900 shadow-sm"
                                : "border-slate-200 bg-white text-slate-800 hover:border-sky-200 hover:bg-sky-50/70"
                            }`}
                          >
                            <p className="font-semibold">{branch.branchName}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
                              {getBranchAddress(branch)}
                            </p>
                            {branch.phoneNumber && (
                              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700">
                                <Phone size={14} />
                                {branch.phoneNumber}
                              </p>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                        Đang tải danh sách chi nhánh...
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-h-[420px] bg-slate-100 p-3 sm:p-4">
                  <div className="h-[420px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white lg:h-full">
                    <iframe
                      title="B-Hub branch map"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        mapQuery,
                      )}&output=embed`}
                      className="h-full w-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-100 bg-sky-50 text-sky-600 shadow-[0_12px_30px_rgba(14,165,233,0.12)]">
            <Phone size={40} />
          </div>

          <h2 className="mb-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Bạn đang đứng tại sân và cần hỗ trợ gấp?
          </h2>

          <p className="mb-10 text-base leading-relaxed text-slate-600 sm:text-lg">
            Gọi hotline chung, B-Hub sẽ điều phối đến nhân viên trực chi nhánh
            gần nhất.
          </p>

          <a
            href="tel:0901234567"
            className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-10 py-4 text-lg font-semibold text-sky-700 shadow-[0_12px_30px_rgba(14,165,233,0.12)] transition-all hover:-translate-y-1 hover:bg-sky-500 hover:text-white sm:px-12 sm:text-xl"
          >
            0901 234 567
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
