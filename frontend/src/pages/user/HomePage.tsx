import React from "react";
import {
  Trophy,
  Users,
  ShoppingBag,
  MapPin,
  Star,
  ChevronRight,
  Zap,
  ShieldCheck,
  MessageCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  // Dữ liệu Hard-code dựa trên Schema Database
  const topBranches = [
    {
      id: 1,
      name: "B-Hub Gò Vấp",
      address: "456 Nguyễn Văn Bảo, Gò Vấp",
      rating: 4.9,
      reviews: 120,
      img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=500",
    },
    {
      id: 2,
      name: "B-Hub Thủ Đức",
      address: "123 Võ Văn Ngân, Thủ Đức",
      rating: 4.8,
      reviews: 85,
      img: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=500",
    },
    {
      id: 3,
      name: "B-Hub Quận 7",
      address: "789 Nguyễn Văn Linh, Q.7",
      rating: 4.7,
      reviews: 210,
      img: "https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?auto=format&fit=crop&q=80&w=500",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Vợt Yonex Astrox 100ZZ",
      price: "4.550.000đ",
      category: "Vợt cầu lông",
      img: "https://images.unsplash.com/photo-1617083281297-af330b53299b?auto=format&fit=crop&q=80&w=300",
    },
    {
      id: 2,
      name: "Giày Victor P9200TTY",
      price: "2.800.000đ",
      category: "Giày",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300",
    },
    {
      id: 3,
      name: "Ống cầu Thành Công",
      price: "250.000đ",
      category: "Phụ kiện",
      img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=300",
    },
  ];

  const recentPosts = [
    {
      id: 1,
      author: "Minh Quang",
      content: "Vừa phá kỷ lục smash tại B-Hub Gò Vấp! Sân cực mướt...",
      likes: 45,
      comments: 12,
    },
    {
      id: 2,
      author: "Trâm Anh",
      content:
        "Cần tìm đối giao lưu sáng mai tại chi nhánh Quận 7, trình độ trung bình khá.",
      likes: 28,
      comments: 5,
    },
  ];

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION - Cực kỳ ấn tượng */}
      {/* 1. HERO SECTION - Đã fix lỗi chồng lấn */}
      <section className="relative min-h-screen md:h-screen flex items-center overflow-hidden bg-sky-900 pt-32 pb-20 md:pt-0 md:pb-0">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1554486855-66168e83be1b?auto=format&fit=crop&q=80&w=1920"
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-950 via-sky-900/80 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col justify-between h-full py-12">
          {/* Text Content & Buttons */}
          <div className="max-w-2xl mt-auto mb-10 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-sky-500/20 backdrop-blur-md border border-sky-400/30 text-sky-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap size={16} fill="currentColor" />
              <span>NỀN TẢNG CẦU LÔNG SỐ 1 VIỆT NAM</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Sân Chơi Chuyên Nghiệp <br />
              <span className="text-sky-400">Đẳng Cấp Quốc Tế</span>
            </h1>
            <p className="text-xl text-sky-100/80 mb-10 leading-relaxed max-w-xl">
              Đặt sân nhanh chóng, mua sắm chính hãng, tìm huấn luyện viên và
              kết nối cộng đồng lông thủ chuyên nghiệp tại B-Hub.
            </p>
            <div className="flex flex-wrap gap-4 relative z-20">
              {" "}
              {/* Thêm z-20 để nút luôn nằm trên */}
              <button
                onClick={() => navigate("/branches")}
                className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-sky-500/20"
              >
                Đặt sân ngay
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">
                Mua sắm dụng cụ
              </button>
            </div>
          </div>

          <div className="">
            <div className="">{}</div>
          </div>
        </div>
      </section>

      {/* 2. DỊCH VỤ CỐT LÕI (Dựa trên Schema: Court, Product, Coach, Post) */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ sinh thái B-Hub
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Tất cả những gì bạn cần cho niềm đam mê cầu lông đều quy tụ tại đây.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Đặt sân trực tuyến",
              desc: "Hệ thống sân tiêu chuẩn thi đấu, đặt lịch chỉ trong 30 giây.",
              icon: <MapPin />,
              color: "bg-blue-500",
            },
            {
              title: "Shop dụng cụ",
              desc: "Vợt, giày, phụ kiện Yonex, Victor, Li-Ning chính hãng 100%.",
              icon: <ShoppingBag />,
              color: "bg-orange-500",
            },
            {
              title: "Tìm HLV giỏi",
              desc: "Đội ngũ huấn luyện viên giàu kinh nghiệm, đào tạo bài bản.",
              icon: <Award />,
              color: "bg-green-500",
            },
            {
              title: "Cộng đồng Social",
              desc: "Giao lưu, tìm đối, chia sẻ khoảnh khắc sân đấu mỗi ngày.",
              icon: <MessageCircle />,
              color: "bg-purple-500",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-sky-100 transition-all duration-300 group border border-transparent hover:border-sky-100"
            >
              <div
                className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-12 transition-transform`}
              >
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {item.desc}
              </p>
              <div className="flex items-center text-sky-600 font-bold text-sm cursor-pointer group-hover:gap-2 transition-all">
                Khám phá <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CHI NHÁNH NỔI BẬT (Branch & BranchImage) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Chi nhánh tiêu biểu
              </h2>
              <p className="text-gray-500">
                Những địa điểm được cộng đồng yêu thích nhất
              </p>
            </div>
            <button
              onClick={() => navigate("/branches")}
              className="hidden md:flex items-center gap-2 text-sky-600 font-bold hover:underline"
            >
              Xem tất cả <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {topBranches.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={b.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={b.name}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold text-sky-600">
                    <Star size={14} fill="currentColor" /> {b.rating}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-sky-600 transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 flex items-center gap-1">
                    <MapPin size={14} /> {b.address}
                  </p>
                  <button className="w-full py-3 bg-gray-100 hover:bg-sky-600 hover:text-white rounded-xl font-bold transition-all text-gray-700">
                    Xem lịch trống
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SHOP & SOCIAL MIX - Điểm nhấn All-in-one */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Sản phẩm bán chạy (Product & ProductVariant) */}
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
              <ShoppingBag className="text-sky-600" /> Dụng cụ chuyên nghiệp
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {featuredProducts.map((p) => (
                <div key={p.id} className="group cursor-pointer">
                  <div className="bg-gray-100 rounded-3xl p-4 mb-4 relative overflow-hidden">
                    <img
                      src={p.img}
                      className="w-full h-48 object-contain group-hover:scale-110 transition-transform"
                      alt={p.name}
                    />
                    <button className="absolute bottom-4 right-4 bg-white p-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <ShoppingBag size={20} className="text-sky-600" />
                    </button>
                  </div>
                  <p className="text-xs text-sky-600 font-bold mb-1 uppercase tracking-wider">
                    {p.category}
                  </p>
                  <h4 className="font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-gray-500 font-bold">{p.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Cộng đồng (Post, Comment, Like) */}
          <div className="lg:col-span-4 bg-sky-900 rounded-[2.5rem] p-8 text-white">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <TrendingUp className="text-sky-400" /> Cộng đồng lông thủ
            </h2>
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold">
                      {post.author[0]}
                    </div>
                    <p className="font-bold text-sm">{post.author}</p>
                  </div>
                  <p className="text-sm text-sky-100/80 mb-4 italic">
                    "{post.content}"
                  </p>
                  <div className="flex gap-4 text-xs text-sky-300">
                    <span className="flex items-center gap-1">
                      ❤️ {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {post.comments}
                    </span>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 border border-white/20 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm">
                Tham gia cộng đồng
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION - Final */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-sky-200">
            {/* Họa tiết nền */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

            <h2 className="text-4xl font-bold text-white mb-6 relative z-10">
              Bắt đầu hành trình chinh phục đỉnh cao cùng B-Hub
            </h2>
            <p className="text-sky-100 mb-10 max-w-xl mx-auto relative z-10">
              Đăng ký tài khoản ngay hôm nay để nhận voucher giảm giá 20% cho
              lần đặt sân đầu tiên.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button className="bg-white text-sky-700 px-10 py-4 rounded-2xl font-bold hover:bg-sky-50 transition-all shadow-xl">
                Đăng ký thành viên
              </button>
              <button className="bg-sky-800 text-white border border-sky-400/30 px-10 py-4 rounded-2xl font-bold hover:bg-sky-900 transition-all">
                Tải ứng dụng Mobile
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
