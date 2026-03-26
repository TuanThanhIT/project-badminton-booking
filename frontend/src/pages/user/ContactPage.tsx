const ContactPage = () => {
  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <div className="bg-blue-500 text-white py-16">
        <div className="w-10/12 mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Liên hệ với B-Hub</h1>
          <p className="text-lg opacity-90">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn đặt sân và mua dụng cụ cầu lông
          </p>
        </div>
      </div>

      <div className="w-10/12 mx-auto py-12">
        {/* CONTACT CARDS */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <p className="text-3xl mb-2">📍</p>
            <h3 className="font-semibold">Địa chỉ</h3>
            <p className="text-gray-500 text-sm">456 Nguyễn Văn Bảo, Gò Vấp</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <p className="text-3xl mb-2">📞</p>
            <h3 className="font-semibold">Điện thoại</h3>
            <p className="text-gray-500 text-sm">0901 234 567</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <p className="text-3xl mb-2">📧</p>
            <h3 className="font-semibold">Email</h3>
            <p className="text-gray-500 text-sm">support@bhub.vn</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
            <p className="text-3xl mb-2">🕒</p>
            <h3 className="font-semibold">Giờ mở cửa</h3>
            <p className="text-gray-500 text-sm">6:00 - 23:00</p>
          </div>
        </div>

        {/* FORM + MAP */}
        <div className="grid grid-cols-12 gap-8">
          {/* FORM */}
          <div className="col-span-6 bg-white p-8 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">Gửi tin nhắn</h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Họ và tên"
                className="border p-3 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-3 rounded-md"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                className="border p-3 rounded-md"
              />
              <textarea
                placeholder="Nội dung"
                rows={4}
                className="border p-3 rounded-md"
              ></textarea>

              <button className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition">
                Gửi liên hệ
              </button>
            </div>
          </div>

          {/* MAP */}
          <div className="col-span-6 rounded-xl overflow-hidden shadow">
            <iframe
              title="map"
              src="https://www.google.com/maps?q=456 Nguyễn Văn Bảo, Gò Vấp, TP.HCM&output=embed"
              className="w-full h-full min-h-[400px] border-0"
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* SUPPORT TEXT */}
        <div className="bg-white rounded-xl shadow p-8 mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Bạn cần hỗ trợ đặt sân?
          </h2>
          <p className="text-gray-600 mb-4">
            Liên hệ hotline hoặc gửi email, chúng tôi sẽ phản hồi trong vòng 24h
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Gọi ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
