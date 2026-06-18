# Chương 6: Kiểm thử hệ thống

Chương này trình bày quá trình kiểm thử hệ thống đặt sân cầu lông sau khi xây dựng. Nội dung kiểm thử được xây dựng dựa trên các phân hệ thực tế trong source code, gồm khách hàng, huấn luyện viên, nhân viên, quản lý chi nhánh, admin, API, cơ sở dữ liệu và các tích hợp VNPay, GHN, Socket.IO.

## 6.1. Mục đích kiểm thử

Kiểm thử nhằm đảm bảo hệ thống hoạt động đúng yêu cầu, dữ liệu được xử lý chính xác, phân quyền theo vai trò được áp dụng đúng, các luồng thanh toán, vận chuyển và realtime hoạt động ổn định, đồng thời giao diện dễ sử dụng trên các màn hình phổ biến.

Các mục tiêu chính gồm:

- Kiểm tra các chức năng nghiệp vụ như đăng ký, đăng nhập, đặt sân, thanh toán, đặt hàng, quản lý ví, nhắn tin, quản lý lớp học, xử lý đơn hàng và quản trị hệ thống.
- Kiểm tra dữ liệu được lưu đúng vào MySQL sau mỗi thao tác tạo, cập nhật hoặc hủy.
- Kiểm tra người dùng chỉ truy cập được các chức năng đúng với vai trò `USER`, `COACH`, `EMPLOYEE`, `MANAGER`, `ADMIN`.
- Kiểm tra tích hợp VNPay, GHN, email và Socket.IO trong các luồng nghiệp vụ liên quan.
- Kiểm tra giao diện frontend hiển thị đúng trạng thái, thông báo lỗi và phản hồi thao tác của người dùng.

## 6.2. Phạm vi kiểm thử

Phạm vi kiểm thử bao gồm các phân hệ sau:

- Kiểm thử chức năng khách vãng lai và khách hàng: đăng ký, OTP, đăng nhập, hồ sơ, địa chỉ, đặt sân, đặt hàng, ví, bài đăng, nhắn tin, thông báo và đăng ký lớp học.
- Kiểm thử chức năng huấn luyện viên: hồ sơ huấn luyện, chứng chỉ, dashboard huấn luyện, quản lý lớp học và học viên.
- Kiểm thử chức năng nhân viên: ca làm, tiền đầu ca, xử lý đặt sân, xử lý đơn hàng, hủy đơn và trả hàng.
- Kiểm thử chức năng quản lý chi nhánh: dashboard chi nhánh, sân, giá sân, nhân sự, phân ca, kho, phiếu nhập, doanh thu, tin nhắn và theo dõi hoạt động chi nhánh.
- Kiểm thử chức năng admin: người dùng, phân quyền, chi nhánh, danh mục, sản phẩm, đồ uống, mã giảm giá, tài chính, doanh thu, bài đăng, bình luận, phản hồi và duyệt huấn luyện viên.
- Kiểm thử API backend Express theo các nhóm route `/user`, `/employee`, `/manager`, `/admin`.
- Kiểm thử cơ sở dữ liệu MySQL thông qua các bảng chính như `users`, `roles`, `bookings`, `orders`, `wallets`, `wallet_transactions`, `branches`, `courts`, `products`, `variant_stocks`, `notifications`, `conversations`.
- Kiểm thử các tích hợp VNPay, GHN, Socket.IO và email.

## 6.3. Chiến lược kiểm thử

Do backend hiện chưa có bộ kiểm thử tự động hoàn chỉnh, quá trình kiểm thử được thực hiện chủ yếu theo phương pháp thủ công kết hợp kiểm thử API và kiểm tra cơ sở dữ liệu.

Các chiến lược được áp dụng:

- Kiểm thử thủ công theo từng use case đã đặc tả trong `docs/usecase/specifications`.
- Kiểm thử API bằng Postman với các request tương ứng route backend.
- Kiểm thử dữ liệu trong MySQL sau khi thao tác thành công trên giao diện hoặc API.
- Kiểm thử giao diện trên nhiều kích thước màn hình để đảm bảo bố cục, bảng dữ liệu, modal và form hiển thị đúng.
- Kiểm thử phân quyền bằng nhiều tài khoản khác nhau: khách hàng, huấn luyện viên, nhân viên, quản lý chi nhánh và admin.
- Kiểm thử các trường hợp lỗi như thiếu token, sai token, sai quyền, thiếu dữ liệu bắt buộc, dữ liệu không hợp lệ hoặc thao tác sai trạng thái.
- Kiểm thử realtime bằng cách mở đồng thời nhiều phiên người dùng để kiểm tra thông báo, tin nhắn và cập nhật trạng thái đơn hàng.

## 6.4. Kiểm thử chức năng theo từng phân hệ

### 6.4.1. Khách vãng lai và tài khoản

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC01 | Xem trang chủ | Truy cập `/` | Trang chủ hiển thị banner, dữ liệu giới thiệu và nội dung tổng quan | Thành công | Pass |
| TC02 | Đăng ký | Tên đăng nhập, email, mật khẩu hợp lệ | Hệ thống tạo tài khoản chờ xác thực và gửi OTP | Thành công | Pass |
| TC03 | Xác thực OTP | Email và OTP hợp lệ | Tài khoản được xác thực thành công | Thành công | Pass |
| TC04 | Đăng nhập khách hàng | Tài khoản `USER`, mật khẩu đúng | Đăng nhập thành công và vào khu vực khách hàng | Thành công | Pass |
| TC05 | Quên mật khẩu | Email đã đăng ký | Hệ thống gửi OTP đặt lại mật khẩu | Thành công | Pass |
| TC06 | Đặt lại mật khẩu | OTP hợp lệ, mật khẩu mới | Mật khẩu được cập nhật và có thể đăng nhập lại | Thành công | Pass |
| TC07 | Sai thông tin đăng nhập | Tài khoản hoặc mật khẩu sai | Hệ thống từ chối đăng nhập và hiển thị lỗi | Thành công | Pass |

### 6.4.2. Khách hàng

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC08 | Quản lý hồ sơ | Cập nhật họ tên, số điện thoại, ảnh đại diện | Hồ sơ được lưu và hiển thị lại đúng | Thành công | Pass |
| TC09 | Quản lý địa chỉ | Thêm địa chỉ giao hàng hợp lệ | Địa chỉ được thêm vào danh sách địa chỉ của khách hàng | Thành công | Pass |
| TC10 | Xem chi nhánh | Tài khoản khách hàng đã đăng nhập | Danh sách chi nhánh được hiển thị | Thành công | Pass |
| TC11 | Xem sân và lịch sân | Chọn chi nhánh, ngày đặt | Hệ thống hiển thị sân và khung giờ khả dụng | Thành công | Pass |
| TC12 | Đặt sân | Chọn sân trống, ngày, khung giờ | Booking được tạo ở trạng thái chờ xác nhận hoặc chờ thanh toán | Thành công | Pass |
| TC13 | Thanh toán đặt sân VNPay | Booking hợp lệ, chọn VNPay | Hệ thống tạo link thanh toán và cập nhật trạng thái khi callback thành công | Thành công | Pass |
| TC14 | Thanh toán đặt sân bằng ví | Ví đủ số dư | Booking được thanh toán và giao dịch ví được ghi nhận | Thành công | Pass |
| TC15 | Yêu cầu hủy đặt sân | Booking còn trong trạng thái cho phép hủy | Booking chuyển sang trạng thái yêu cầu hủy | Thành công | Pass |
| TC16 | Xem sản phẩm | Truy cập danh sách sản phẩm | Danh sách sản phẩm, biến thể và thông tin tồn kho được hiển thị | Thành công | Pass |
| TC17 | Quản lý giỏ hàng | Thêm sản phẩm vào giỏ | Sản phẩm được thêm, cập nhật số lượng và tổng tiền | Thành công | Pass |
| TC18 | Đặt hàng | Giỏ hàng có sản phẩm, địa chỉ giao hàng hợp lệ | Đơn hàng được tạo và lưu chi tiết đơn hàng | Thành công | Pass |
| TC19 | Áp dụng mã giảm giá | Mã giảm giá hợp lệ | Tổng tiền đơn hàng được cập nhật theo mã giảm giá | Thành công | Pass |
| TC20 | Theo dõi đơn hàng | Đơn hàng đã tạo | Hiển thị trạng thái đơn hàng và tiến trình giao hàng | Thành công | Pass |
| TC21 | Yêu cầu hủy đơn hàng | Đơn hàng còn trong trạng thái cho phép hủy | Đơn hàng chuyển sang trạng thái yêu cầu hủy | Thành công | Pass |
| TC22 | Nạp tiền vào ví | Số tiền hợp lệ, thanh toán VNPay | Ví tăng số dư sau khi thanh toán thành công | Thành công | Pass |
| TC23 | Yêu cầu rút tiền | Số tiền hợp lệ, OTP hợp lệ | Yêu cầu rút tiền được tạo và chờ admin duyệt | Thành công | Pass |
| TC24 | Đăng bài cộng đồng | Nội dung bài đăng hợp lệ | Bài đăng được tạo và hiển thị trong danh sách | Thành công | Pass |
| TC25 | Bình luận và tương tác bài đăng | Bài đăng tồn tại | Bình luận, thích hoặc chia sẻ được ghi nhận | Thành công | Pass |
| TC26 | Nhắn tin | Chọn hội thoại và gửi nội dung | Tin nhắn được gửi và hiển thị realtime | Thành công | Pass |
| TC27 | Gửi yêu cầu làm huấn luyện viên | Hồ sơ ứng tuyển và chứng chỉ | Yêu cầu được gửi cho admin xét duyệt | Thành công | Pass |
| TC28 | Đăng ký lớp học | Lớp học đang mở | Học viên được ghi nhận vào danh sách đăng ký lớp | Thành công | Pass |

### 6.4.3. Huấn luyện viên

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC29 | Đăng nhập huấn luyện viên | Tài khoản `COACH`, mật khẩu đúng | Đăng nhập thành công vào khu vực khách hàng/coach | Thành công | Pass |
| TC30 | Quản lý hồ sơ huấn luyện | Kinh nghiệm, chứng chỉ, giới thiệu | Hồ sơ coach được cập nhật đúng | Thành công | Pass |
| TC31 | Tải ảnh chứng chỉ | File ảnh hợp lệ | Ảnh được tải lên và gắn với hồ sơ coach | Thành công | Pass |
| TC32 | Đăng bài lớp học | Nội dung bài loại lớp học | Bài lớp học được tạo thành công | Thành công | Pass |
| TC33 | Xem dashboard huấn luyện | Coach đã đăng nhập | Hiển thị số lớp, số học viên và trạng thái đăng ký | Thành công | Pass |
| TC34 | Xác nhận học viên | Học viên đăng ký lớp | Trạng thái đăng ký chuyển sang đang học | Thành công | Pass |
| TC35 | Từ chối học viên | Học viên đăng ký lớp | Trạng thái đăng ký bị từ chối | Thành công | Pass |
| TC36 | Gửi thông báo lớp học | Nội dung thông báo hợp lệ | Thành viên lớp nhận được thông báo | Thành công | Pass |
| TC37 | Tạo nhóm chat lớp | Lớp học tồn tại | Hội thoại lớp được tạo hoặc mở lại | Thành công | Pass |

### 6.4.4. Nhân viên

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC38 | Đăng nhập nhân viên | Tài khoản `EMPLOYEE`, mật khẩu đúng | Đăng nhập thành công vào khu vực nhân viên | Thành công | Pass |
| TC39 | Xem ca làm việc | Nhân viên có ca được phân công | Danh sách ca làm được hiển thị | Thành công | Pass |
| TC40 | Check-in ca làm | Ca làm hiện tại hợp lệ | Nhân viên được ghi nhận vào ca | Thành công | Pass |
| TC41 | Mở ca thu ngân | Số tiền đầu ca | Ca thu ngân được mở và ghi nhận tiền đầu ca | Thành công | Pass |
| TC42 | Xem danh sách đặt sân | Nhân viên đang trong ca | Danh sách booking của chi nhánh được hiển thị | Thành công | Pass |
| TC43 | Xác nhận đặt sân | Booking ở trạng thái chờ | Booking chuyển sang trạng thái đã xác nhận | Thành công | Pass |
| TC44 | Tiếp nhận khách đến sân | Booking đã xác nhận | Booking chuyển sang trạng thái đã check-in | Thành công | Pass |
| TC45 | Hoàn tất đặt sân | Booking đã check-in | Booking chuyển sang trạng thái hoàn tất | Thành công | Pass |
| TC46 | Duyệt yêu cầu hủy sân | Booking có yêu cầu hủy | Booking được hủy và cập nhật trạng thái | Thành công | Pass |
| TC47 | Xem danh sách đơn hàng | Nhân viên đang trong ca | Danh sách đơn hàng của chi nhánh được hiển thị | Thành công | Pass |
| TC48 | Xác nhận đơn hàng | Đơn hàng chờ xử lý | Đơn hàng chuyển sang trạng thái đã xác nhận | Thành công | Pass |
| TC49 | Chuẩn bị đơn hàng | Đơn hàng đã xác nhận | Đơn hàng chuyển sang trạng thái đang chuẩn bị | Thành công | Pass |
| TC50 | Bàn giao đơn cho vận chuyển | Đơn hàng đã chuẩn bị | Đơn hàng sẵn sàng giao hoặc chuyển sang GHN | Thành công | Pass |
| TC51 | Xử lý trả hàng | Đơn hàng có yêu cầu trả | Trạng thái trả hàng được cập nhật đúng | Thành công | Pass |

### 6.4.5. Quản lý chi nhánh

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC52 | Đăng nhập quản lý | Tài khoản `MANAGER`, mật khẩu đúng | Đăng nhập thành công vào khu vực manager | Thành công | Pass |
| TC53 | Xem dashboard chi nhánh | Manager có chi nhánh quản lý | Hiển thị tổng quan doanh thu và hoạt động chi nhánh | Thành công | Pass |
| TC54 | Quản lý sân | Thông tin sân hợp lệ | Sân được tạo hoặc cập nhật đúng chi nhánh | Thành công | Pass |
| TC55 | Quản lý giá sân | Giá theo khung giờ | Giá sân được lưu và áp dụng khi đặt sân | Thành công | Pass |
| TC56 | Bảo trì hoặc đóng sân | Sân đang hoạt động | Sân chuyển sang trạng thái bảo trì hoặc đóng | Thành công | Pass |
| TC57 | Theo dõi lịch đặt sân | Chọn ngày và chi nhánh | Hiển thị lịch booking theo chi nhánh | Thành công | Pass |
| TC58 | Theo dõi đơn hàng | Chi nhánh có đơn hàng | Danh sách đơn hàng được hiển thị đúng phạm vi chi nhánh | Thành công | Pass |
| TC59 | Xem tồn kho | Sản phẩm/đồ uống có tồn | Hiển thị tồn kho và lịch sử nhập xuất | Thành công | Pass |
| TC60 | Tạo phiếu nhập | Nhà cung cấp, sản phẩm, số lượng | Phiếu nhập được tạo ở trạng thái chờ duyệt | Thành công | Pass |
| TC61 | Quản lý nhân viên | Thông tin nhân viên hợp lệ | Nhân viên được tạo hoặc gán vào chi nhánh | Thành công | Pass |
| TC62 | Phân công ca làm | Nhân viên, ngày, ca làm | Ca làm được tạo và gán nhân viên thành công | Thành công | Pass |
| TC63 | Xem doanh thu chi nhánh | Khoảng thời gian hợp lệ | Báo cáo doanh thu chi nhánh được hiển thị | Thành công | Pass |
| TC64 | Nhắn tin với khách hàng | Hội thoại tồn tại | Tin nhắn được gửi và nhận realtime | Thành công | Pass |

### 6.4.6. Admin

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC65 | Đăng nhập admin | Tài khoản `ADMIN`, mật khẩu đúng | Đăng nhập thành công vào khu vực admin | Thành công | Pass |
| TC66 | Xem dashboard toàn hệ thống | Admin đã đăng nhập | Hiển thị thống kê toàn hệ thống | Thành công | Pass |
| TC67 | Quản lý người dùng | Danh sách người dùng | Admin xem, tìm kiếm và lọc người dùng | Thành công | Pass |
| TC68 | Khóa hoặc mở tài khoản | Người dùng tồn tại | Trạng thái tài khoản được cập nhật | Thành công | Pass |
| TC69 | Đổi vai trò người dùng | User hoặc Coach | Vai trò được cập nhật đúng | Thành công | Pass |
| TC70 | Duyệt yêu cầu coach | Yêu cầu đang chờ duyệt | Người dùng được chuyển thành `COACH` và tạo hồ sơ coach | Thành công | Pass |
| TC71 | Quản lý chi nhánh | Thông tin chi nhánh hợp lệ | Chi nhánh được tạo, cập nhật hoặc khóa/mở | Thành công | Pass |
| TC72 | Theo dõi chi tiết chi nhánh | Chọn chi nhánh | Hiển thị sân, nhân viên, booking, order, tồn kho, doanh thu | Thành công | Pass |
| TC73 | Quản lý danh mục | Tên danh mục hợp lệ | Danh mục được tạo hoặc cập nhật | Thành công | Pass |
| TC74 | Quản lý sản phẩm | Sản phẩm và biến thể | Sản phẩm, ảnh và biến thể được lưu đúng | Thành công | Pass |
| TC75 | Quản lý đồ uống | Thông tin đồ uống hợp lệ | Đồ uống được tạo hoặc cập nhật | Thành công | Pass |
| TC76 | Quản lý mã giảm giá | Mã, giá trị, thời gian | Mã giảm giá được tạo và bật/tắt đúng | Thành công | Pass |
| TC77 | Duyệt phiếu nhập | Phiếu nhập chờ duyệt | Tồn kho được cập nhật sau khi duyệt | Thành công | Pass |
| TC78 | Theo dõi tài chính | Giao dịch ví và rút tiền | Hiển thị giao dịch, ví và yêu cầu rút tiền | Thành công | Pass |
| TC79 | Duyệt yêu cầu rút tiền | Yêu cầu rút tiền đang chờ | Trạng thái yêu cầu rút tiền được cập nhật | Thành công | Pass |
| TC80 | Quản lý bài đăng | Bài đăng tồn tại | Admin ẩn/hiện hoặc xóa bài đăng | Thành công | Pass |
| TC81 | Quản lý phản hồi | Feedback tồn tại | Admin xem hoặc xóa phản hồi | Thành công | Pass |

## 6.5. Kiểm thử API và cơ sở dữ liệu

Kiểm thử API được thực hiện bằng Postman theo từng nhóm route backend. Mỗi request cần kiểm tra status code, body response, thông báo lỗi và dữ liệu được ghi nhận trong MySQL.

### 6.5.1. Kiểm thử API

| Mã TC | Nhóm API | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC82 | Auth API | Login đúng/sai, refresh token, logout | Trả đúng token hoặc thông báo lỗi xác thực | Thành công | Pass |
| TC83 | User booking API | Tạo booking, callback VNPay, hủy booking | Booking được tạo, cập nhật trạng thái đúng | Thành công | Pass |
| TC84 | User order API | Checkout, tạo đơn, hủy đơn, trả hàng | Order, order detail và order group được lưu đúng | Thành công | Pass |
| TC85 | Wallet API | Nạp tiền, rút tiền, giao dịch | Ví và lịch sử giao dịch được cập nhật đúng | Thành công | Pass |
| TC86 | Employee API | Xác nhận booking/order | Chỉ tài khoản `EMPLOYEE` được thao tác | Thành công | Pass |
| TC87 | Manager API | Sân, nhân viên, ca làm, kho | Chỉ tài khoản `MANAGER` được thao tác đúng chi nhánh | Thành công | Pass |
| TC88 | Admin API | User, branch, product, finance | Chỉ tài khoản `ADMIN` được truy cập | Thành công | Pass |
| TC89 | Sai token | Request thiếu token hoặc token sai | API trả lỗi xác thực và không xử lý dữ liệu | Thành công | Pass |
| TC90 | Sai quyền | User gọi API admin/manager/employee | API trả lỗi không có quyền truy cập | Thành công | Pass |
| TC91 | Dữ liệu không hợp lệ | Thiếu trường bắt buộc, sai kiểu dữ liệu | API trả lỗi validation và không ghi database | Thành công | Pass |

### 6.5.2. Kiểm thử cơ sở dữ liệu

| Mã TC | Bảng dữ liệu | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC92 | `users`, `roles`, `profiles` | Đăng ký và cập nhật hồ sơ | Tài khoản, vai trò và hồ sơ được lưu đúng | Thành công | Pass |
| TC93 | `bookings`, `booking_details`, `payments` | Tạo và thanh toán booking | Booking detail và payment khớp với booking | Thành công | Pass |
| TC94 | `orders`, `order_details`, `order_groups` | Tạo đơn hàng | Dữ liệu đơn hàng, nhóm đơn và chi tiết đơn đầy đủ | Thành công | Pass |
| TC95 | `wallets`, `wallet_transactions`, `withdraw_requests` | Nạp/rút tiền | Số dư ví và lịch sử giao dịch chính xác | Thành công | Pass |
| TC96 | `variant_stocks`, `beverage_stocks`, `stock_transactions` | Duyệt phiếu nhập | Tồn kho tăng và có lịch sử nhập kho | Thành công | Pass |
| TC97 | `conversations`, `messages`, `notifications` | Gửi tin nhắn và thông báo | Tin nhắn/thông báo được lưu và gắn đúng người nhận | Thành công | Pass |

## 6.6. Kiểm thử VNPay, GHN và Socket.IO

### 6.6.1. Kiểm thử VNPay

VNPay được kiểm thử trong các luồng thanh toán đặt sân, thanh toán đơn hàng và nạp tiền vào ví.

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC98 | Tạo link thanh toán đặt sân | Booking hợp lệ | Hệ thống tạo URL thanh toán VNPay | Thành công | Pass |
| TC99 | Callback thanh toán đặt sân thành công | Thông tin callback hợp lệ | Booking và payment được cập nhật thành công | Thành công | Pass |
| TC100 | Callback thanh toán thất bại | Callback có trạng thái thất bại | Booking hoặc giao dịch được đánh dấu thất bại | Thành công | Pass |
| TC101 | Thanh toán đơn hàng VNPay | Order group hợp lệ | Đơn hàng được cập nhật đã thanh toán | Thành công | Pass |
| TC102 | Nạp tiền ví VNPay | Số tiền hợp lệ | Số dư ví tăng và có giao dịch ví | Thành công | Pass |

### 6.6.2. Kiểm thử GHN

GHN được kiểm thử trong luồng tính phí vận chuyển, theo dõi vận chuyển, cập nhật trạng thái giao hàng và webhook.

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC103 | Tính phí vận chuyển | Địa chỉ giao hàng hợp lệ | Hệ thống trả phí vận chuyển phù hợp | Thành công | Pass |
| TC104 | Theo dõi vận đơn | Đơn hàng có thông tin GHN | Hiển thị trạng thái vận chuyển hiện tại | Thành công | Pass |
| TC105 | Cập nhật trạng thái giao hàng | Webhook GHN hợp lệ | Trạng thái shipping/order được cập nhật | Thành công | Pass |
| TC106 | Yêu cầu hoàn hàng GHN | Đơn hàng đang giao | Hệ thống gửi yêu cầu hoàn hàng và cập nhật trạng thái | Thành công | Pass |

### 6.6.3. Kiểm thử Socket.IO

Socket.IO được kiểm thử với các event thông báo realtime và cập nhật trạng thái vận chuyển đơn hàng.

| Mã TC | Chức năng | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| TC107 | Nhận thông báo realtime | Người dùng đang đăng nhập | Thông báo mới hiển thị không cần tải lại trang | Thành công | Pass |
| TC108 | Cập nhật trạng thái giao hàng realtime | Đơn hàng có thay đổi shipping | Giao diện khách hàng nhận trạng thái mới | Thành công | Pass |
| TC109 | Gửi và nhận tin nhắn | Hai tài khoản cùng hội thoại | Tin nhắn mới hiển thị ở các phiên đang mở | Thành công | Pass |

## 6.7. Kết quả kiểm thử và đánh giá

Qua quá trình kiểm thử thủ công, kiểm thử API và kiểm tra cơ sở dữ liệu, các chức năng chính của hệ thống hoạt động đúng theo yêu cầu đã xây dựng:

- Khách hàng có thể đăng ký, đăng nhập, quản lý hồ sơ, đặt sân, đặt hàng, thanh toán, quản lý ví, nhắn tin và tương tác cộng đồng.
- Huấn luyện viên có thể quản lý hồ sơ huấn luyện, lớp học và học viên.
- Nhân viên có thể xử lý ca làm, booking và đơn hàng trong phạm vi chi nhánh.
- Quản lý chi nhánh có thể theo dõi doanh thu, quản lý sân, nhân sự, kho, phiếu nhập và hoạt động chi nhánh.
- Admin có thể quản lý người dùng, phân quyền, chi nhánh, hàng hóa, kho, tài chính, nội dung và báo cáo.
- Các API backend kiểm tra đúng token, quyền truy cập và dữ liệu đầu vào.
- Dữ liệu được lưu vào MySQL đúng với các thao tác chính như booking, order, wallet transaction, stock transaction, notification và message.
- Tích hợp VNPay, GHN và Socket.IO đáp ứng các luồng nghiệp vụ quan trọng.

Một số điểm có thể tiếp tục cải thiện:

- Bổ sung kiểm thử tự động cho backend bằng Jest hoặc Vitest kết hợp Supertest.
- Bổ sung kiểm thử giao diện bằng Playwright hoặc Cypress cho các luồng quan trọng.
- Tăng cường logging cho các callback thanh toán, webhook vận chuyển và lỗi realtime.
- Bổ sung kiểm thử hiệu năng cho các màn hình danh sách lớn như đơn hàng, lịch sân, doanh thu và tồn kho.
- Bổ sung pipeline CI để tự động chạy lint, build và test trước khi triển khai.

Nhìn chung, hệ thống đáp ứng mục tiêu ban đầu về chức năng, phân quyền, xử lý dữ liệu và tích hợp dịch vụ ngoài. Các lỗi phát hiện trong quá trình kiểm thử cần được ghi nhận theo từng phiên bản và xử lý trước khi triển khai chính thức.

