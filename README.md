🏸 Badminton Court Booking & Management System
📌 Giới thiệu
Dự án Badminton Court Booking & Management System là một hệ thống ứng dụng web tích hợp phục vụ cho dịch vụ đặt sân cầu lông và quản lý hoạt động kinh doanh.
Hệ thống cho phép khách hàng đặt sân trực tuyến, mua sản phẩm liên quan đến cầu lông và thanh toán online; đồng thời hỗ trợ nhân viên và quản trị viên trong việc quản lý lịch sân, đơn hàng, ca làm việc và doanh thu.
Dự án được thực hiện trong khuôn khổ Tiểu luận chuyên ngành – Khoa Công nghệ Thông tin – Trường Đại học Sư Phạm Kỹ Thuật TP. Hồ Chí Minh.

👥 Nhóm thực hiện
Nguyễn Tuấn Thành – 22110418
Huỳnh Thái Toàn – 22110436
Giảng viên hướng dẫn: ThS. Vũ Đình Bảo
Thời gian thực hiện: Học kỳ I – Năm học 2025–2026

🎯 Mục tiêu dự án
Xây dựng hệ thống đặt sân cầu lông trực tuyến theo thời gian thực
Tích hợp bán sản phẩm, giỏ hàng và thanh toán online
Hỗ trợ quản lý toàn diện cho cơ sở kinh doanh:
Quản lý sân, lịch sân
Quản lý đơn hàng, sản phẩm, khuyến mãi
Quản lý người dùng và ca làm việc
Thống kê và báo cáo doanh thu
Áp dụng các công nghệ web hiện đại vào một bài toán thực tế

🧩 Các nhóm chức năng chính
👤 Khách hàng
Đăng ký / đăng nhập (OTP qua email)
Đặt sân theo khung giờ
Xem lịch sử đặt sân và đơn hàng
Mua sản phẩm, thêm vào giỏ hàng
Áp mã khuyến mãi và thanh toán online (MoMo)
Theo dõi trạng thái đơn hàng, lịch sân (realtime)
Đánh giá sản phẩm và dịch vụ

🧑‍💼 Nhân viên
Đăng nhập hệ thống nhân viên
Nhận ca / kết thúc ca làm
Nhập tiền mặt đầu ca – cuối ca
Quản lý đơn hàng và lịch đặt sân trực tiếp tại quầy
Xác nhận, hoàn thành hoặc hủy đơn theo yêu cầu khách hàng

👑 Quản trị viên (Admin)
Quản lý người dùng và phân quyền
Quản lý sân cầu lông, lịch sân và giá sân
Quản lý sản phẩm, danh mục, biến thể
Quản lý khuyến mãi
Quản lý ca làm và phân công nhân viên
Thống kê và báo cáo doanh thu
Theo dõi toàn bộ hoạt động hệ thống

🏗️ Kiến trúc hệ thống
Hệ thống được xây dựng theo mô hình Client – Server, bao gồm:
Frontend: React + TypeScript
Backend: NodeJS + Express
Database: MySQL
Realtime: WebSocket
Thanh toán: MoMo Payment Gateway
Client (Web)
   |
   | REST API / WebSocket
   |
Backend (NodeJS - Express)
   |
   | Sequelize ORM
   |
Database (MySQL)

🛠️ Công nghệ sử dụng
Frontend
React
TypeScript
Redux Toolkit
Axios
Tailwind CSS

Backend
NodeJS
ExpressJS
Sequelize ORM
RESTful API
WebSocket

Database
MySQL

Khác
MoMo Payment Gateway
JWT Authentication
OTP qua Email
Git & GitHub

📂 Cấu trúc thư mục (gợi ý)
project-root/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── redux/
│   │   └── services/
│   └── package.json
│
└── README.md

🚀 Cài đặt & chạy dự án
1️⃣ Clone project
git clone https://github.com/TuanThanhIT/project-badminton-booking
2️⃣ Cài đặt Backend
cd backend
npm install
npm run dev
3️⃣ Cài đặt Frontend
cd frontend
npm install
npm run dev
4️⃣ Cấu hình môi trường
Tạo file .env cho backend:
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=

🧪 Kiểm thử
Kiểm thử chức năng cho:
Admin
Nhân viên
Khách hàng
Kiểm thử API và luồng nghiệp vụ
Kiểm thử tích hợp thanh toán MoMo
Kiểm thử realtime với WebSocket

📈 Kết quả đạt được
Hoàn thiện hệ thống đặt sân và quản lý dịch vụ cầu lông
Giao diện trực quan, thân thiện người dùng
API backend rõ ràng, dễ mở rộng
Xử lý realtime ổn định
Áp dụng thành công thanh toán trực tuyến

🔮 Hướng phát triển
Triển khai mobile app (Android / iOS)
Tối ưu hiệu năng và bảo mật
Thêm hệ thống gợi ý khung giờ, sân phù hợp
Mở rộng cho nhiều chi nhánh sân cầu lông
Tích hợp thêm cổng thanh toán khác

📄 Giấy phép
Dự án được thực hiện phục vụ mục đích học tập và nghiên cứu.
