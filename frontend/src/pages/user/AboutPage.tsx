const AboutPage = () => {
  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="w-10/12 mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Giới thiệu về B-Hub</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Nền tảng đặt sân cầu lông và mua sắm dụng cụ thể thao hiện đại, giúp
            người chơi tìm sân, đặt lịch và mua sắm nhanh chóng.
          </p>
        </div>
      </div>

      <div className="w-10/12 mx-auto py-16">
        {/* ABOUT */}
        <div className="grid grid-cols-2 gap-12 items-center mb-20">
          <img
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc"
            className="rounded-xl shadow-lg"
          />

          <div>
            <h2 className="text-3xl font-bold mb-4">B-Hub là gì?</h2>
            <p className="text-gray-600 mb-3">
              B-Hub là hệ thống đặt sân cầu lông và mua sắm dụng cụ cầu lông
              trực tuyến, giúp người chơi dễ dàng tìm sân trống, đặt lịch nhanh
              chóng và quản lý lịch chơi của mình.
            </p>
            <p className="text-gray-600 mb-3">
              Chúng tôi cung cấp hệ thống nhiều chi nhánh, sân chất lượng cao,
              giá cả minh bạch và dịch vụ chuyên nghiệp.
            </p>
            <p className="text-gray-600">
              Mục tiêu của chúng tôi là xây dựng một hệ sinh thái cầu lông hiện
              đại, nơi người chơi có thể đặt sân, mua sắm và kết nối cộng đồng.
            </p>
          </div>
        </div>

        {/* MISSION */}
        <div className="grid grid-cols-3 gap-6 mb-20">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-2">🎯 Sứ mệnh</h3>
            <p className="text-gray-600 text-sm">
              Mang đến nền tảng đặt sân cầu lông nhanh chóng, tiện lợi và hiện
              đại.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-2">👁 Tầm nhìn</h3>
            <p className="text-gray-600 text-sm">
              Trở thành hệ thống đặt sân cầu lông lớn nhất Việt Nam.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-2">💎 Giá trị</h3>
            <p className="text-gray-600 text-sm">
              Uy tín - Chất lượng - Nhanh chóng - Tiện lợi.
            </p>
          </div>
        </div>

        {/* SERVICES */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            Dịch vụ của chúng tôi
          </h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg transition">
              <p className="text-4xl mb-3">🏸</p>
              <h3 className="font-semibold mb-2">Đặt sân</h3>
              <p className="text-gray-500 text-sm">
                Đặt sân nhanh chóng và tiện lợi chỉ trong vài bước.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg transition">
              <p className="text-4xl mb-3">🛒</p>
              <h3 className="font-semibold mb-2">Cửa hàng</h3>
              <p className="text-gray-500 text-sm">
                Bán dụng cụ cầu lông chính hãng, giá tốt.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg transition">
              <p className="text-4xl mb-3">📅</p>
              <h3 className="font-semibold mb-2">Quản lý lịch</h3>
              <p className="text-gray-500 text-sm">
                Theo dõi và quản lý lịch đặt sân dễ dàng.
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-12 mb-20">
          <div className="grid grid-cols-4 text-center">
            <div>
              <h3 className="text-3xl font-bold">10+</h3>
              <p>Chi nhánh</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">50+</h3>
              <p>Sân cầu lông</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">1000+</h3>
              <p>Khách hàng</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">5</h3>
              <p>Năm hoạt động</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Đặt sân ngay hôm nay</h2>
          <p className="mb-4 text-gray-600">
            Trải nghiệm hệ thống đặt sân hiện đại của B-Hub
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Đặt sân ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
